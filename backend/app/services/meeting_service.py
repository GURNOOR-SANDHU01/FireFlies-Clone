"""
File: backend/app/services/meeting_service.py

Purpose:
Business logic and workflow orchestration layer for meetings, transcripts, action items, and summaries.

Responsibilities:
- Coordinate between database repositories and presentation schemas.
- Transform query tuples with scalar count subqueries into serialized response dicts.
- Process custom or supplied transcript text on meeting creation into segments, topics, summary, and action items.
- Provide automated mock generation when transcript text is not provided.
- Enforce business rules and domain validations.

This module does NOT:
- Handle HTTP requests, status codes, or FastAPI Depends directly.
- Execute direct SQL statements.
"""

import json
import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session

from app.models.meeting import Meeting
from app.models.transcript import Transcript
from app.models.action_item import ActionItem
from app.models.topic import Topic
from app.models.summary import Summary
from app.schemas.meeting import MeetingCreate, MeetingUpdate, ParticipantSchema
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate
from app.repositories.meeting_repo import meeting_repo
from app.repositories.action_item_repo import action_item_repo


class MeetingService:
    @staticmethod
    def _serialize_participants(participants: Optional[List[Any]]) -> str:
        if participants is None:
            return json.dumps([
                {"id": "att-host", "name": "Elena Rostova", "email": "elena@fireflies.ai", "is_host": True}
            ])
        result = []
        for p in participants:
            if isinstance(p, ParticipantSchema):
                result.append(p.model_dump())
            elif isinstance(p, dict):
                result.append(p)
            elif isinstance(p, str):
                result.append({"id": None, "name": p.strip(), "email": None, "is_host": False})
        return json.dumps(result)

    @staticmethod
    def _deserialize_participants(raw: Optional[str]) -> List[ParticipantSchema]:
        if not raw:
            return []
        try:
            items = json.loads(raw)
            return [ParticipantSchema(**item) for item in items]
        except Exception:
            return []

    @classmethod
    def _to_meeting_dict(
        cls,
        meeting: Meeting,
        action_count: Optional[int] = None,
        completed_action_count: Optional[int] = None,
        transcript_count: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Transforms a Meeting ORM object into a dictionary conforming to MeetingResponse.
        Uses precomputed SQL scalar counts if provided, avoiding any need to load transcripts.
        """
        participants = cls._deserialize_participants(meeting.participants)
        summary_preview = meeting.summary.overview if meeting.summary else None

        # Fallback counts if not provided via scalar subquery
        if action_count is None:
            action_items = meeting.action_items or []
            action_count = len(action_items)
            completed_action_count = sum(1 for item in action_items if item.completed)

        if transcript_count is None:
            transcript_count = len(meeting.transcripts) if meeting.transcripts else 0

        return {
            "id": meeting.id,
            "title": meeting.title,
            "date": meeting.date,
            "duration": meeting.duration,
            "platform": meeting.platform,
            "status": meeting.status,
            "audio_url": meeting.audio_url,
            "has_transcript": meeting.has_transcript,
            "participants": participants,
            "action_items_count": action_count or 0,
            "completed_action_items_count": completed_action_count or 0,
            "transcript_segments_count": transcript_count or 0,
            "summary_preview": summary_preview,
            "created_at": meeting.created_at,
            "updated_at": meeting.updated_at,
        }

    @classmethod
    def list_meetings(
        cls,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        participant: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        status: Optional[str] = None,
        platform: Optional[str] = None,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Returns paginated meetings with scalar count subqueries.
        Transcript segments are NEVER loaded into memory here for maximum dashboard performance.
        """
        rows, total = meeting_repo.get_meetings(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            participant=participant,
            date_from=date_from,
            date_to=date_to,
            status=status,
            platform=platform,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        serialized = [
            cls._to_meeting_dict(
                meeting=meeting,
                action_count=act_cnt,
                completed_action_count=comp_cnt,
                transcript_count=trn_cnt,
            )
            for meeting, act_cnt, comp_cnt, trn_cnt in rows
        ]
        return serialized, total

    @classmethod
    def get_meeting(cls, db: Session, meeting_id: str) -> Optional[Dict[str, Any]]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None
        # Retrieve lightweight counts without loading full transcript text
        transcripts = meeting_repo.get_transcripts(db, meeting_id)
        action_items = action_item_repo.get_by_meeting(db, meeting_id)
        completed_actions = sum(1 for item in action_items if item.completed)

        return cls._to_meeting_dict(
            meeting=meeting,
            action_count=len(action_items),
            completed_action_count=completed_actions,
            transcript_count=len(transcripts),
        )

    @classmethod
    def create_meeting(cls, db: Session, payload: MeetingCreate) -> Dict[str, Any]:
        meeting_id = f"meet-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # Participants can be passed as strings or schemas (already normalized in Pydantic schema)
        participants_json = cls._serialize_participants(payload.participants)

        meeting = Meeting(
            id=meeting_id,
            title=payload.title,
            date=payload.date.replace(tzinfo=None) if payload.date.tzinfo else payload.date,
            duration=payload.duration,
            platform=payload.platform,
            status=payload.status,
            audio_url=payload.audio_url,
            participants=participants_json,
            has_transcript=True,
            created_at=now,
            updated_at=now,
        )
        created_meeting = meeting_repo.create(db, meeting)

        # Handle transcript creation
        if payload.transcript_text and payload.transcript_text.strip():
            cls._process_custom_transcript(
                db=db,
                meeting_id=meeting_id,
                title=payload.title,
                duration=payload.duration,
                transcript_text=payload.transcript_text.strip(),
                participants=payload.participants,
            )
        else:
            cls._generate_mock_artifacts(db, meeting_id, payload.title, payload.duration)

        return cls.get_meeting(db, meeting_id) or cls._to_meeting_dict(created_meeting)

    @classmethod
    def update_meeting(cls, db: Session, meeting_id: str, payload: MeetingUpdate) -> Optional[Dict[str, Any]]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if payload.title is not None:
            meeting.title = payload.title
        if payload.date is not None:
            meeting.date = payload.date.replace(tzinfo=None) if payload.date.tzinfo else payload.date
        if payload.duration is not None:
            meeting.duration = payload.duration
        if payload.platform is not None:
            meeting.platform = payload.platform
        if payload.status is not None:
            meeting.status = payload.status
        if payload.audio_url is not None:
            meeting.audio_url = payload.audio_url
        if payload.participants is not None:
            meeting.participants = cls._serialize_participants(payload.participants)

        meeting.updated_at = now
        meeting_repo.update(db, meeting)
        return cls.get_meeting(db, meeting_id)

    @classmethod
    def delete_meeting(cls, db: Session, meeting_id: str) -> bool:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return False
        meeting_repo.delete(db, meeting)
        return True

    @classmethod
    def get_transcripts(cls, db: Session, meeting_id: str) -> Optional[List[Transcript]]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None
        return meeting_repo.get_transcripts(db, meeting_id)

    @classmethod
    def get_topics(cls, db: Session, meeting_id: str) -> Optional[List[Topic]]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None
        return meeting_repo.get_topics(db, meeting_id)

    @classmethod
    def get_summary(cls, db: Session, meeting_id: str) -> Optional[Dict[str, Any]]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None
        summary = meeting_repo.get_summary(db, meeting_id)
        if not summary:
            return None

        try:
            takeaways = json.loads(summary.key_takeaways)
        except Exception:
            takeaways = []

        return {
            "id": summary.id,
            "meeting_id": summary.meeting_id,
            "overview": summary.overview,
            "key_takeaways": takeaways,
            "generated_at": summary.generated_at,
        }

    # Action Items
    @classmethod
    def get_action_items(cls, db: Session, meeting_id: str) -> Optional[List[ActionItem]]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None
        return action_item_repo.get_by_meeting(db, meeting_id)

    @classmethod
    def create_action_item(cls, db: Session, meeting_id: str, payload: ActionItemCreate) -> Optional[ActionItem]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            return None

        item_id = f"act-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        due = payload.due_date.replace(tzinfo=None) if payload.due_date and payload.due_date.tzinfo else payload.due_date

        action_item = ActionItem(
            id=item_id,
            meeting_id=meeting_id,
            title=payload.title,
            assignee=payload.assignee,
            due_date=due,
            completed=False,
            created_at=now,
        )
        return action_item_repo.create(db, action_item)

    @classmethod
    def update_action_item(cls, db: Session, action_item_id: str, payload: ActionItemUpdate) -> Optional[ActionItem]:
        item = action_item_repo.get_by_id(db, action_item_id)
        if not item:
            return None

        if payload.title is not None:
            item.title = payload.title
        if payload.assignee is not None:
            item.assignee = payload.assignee
        if payload.due_date is not None:
            item.due_date = payload.due_date.replace(tzinfo=None) if payload.due_date.tzinfo else payload.due_date
        if payload.completed is not None:
            item.completed = payload.completed

        return action_item_repo.update(db, item)

    @classmethod
    def delete_action_item(cls, db: Session, action_item_id: str) -> bool:
        item = action_item_repo.get_by_id(db, action_item_id)
        if not item:
            return False
        action_item_repo.delete(db, item)
        return True

    @classmethod
    def _process_custom_transcript(
        cls,
        db: Session,
        meeting_id: str,
        title: str,
        duration: int,
        transcript_text: str,
        participants: Optional[List[ParticipantSchema]] = None,
    ) -> None:
        """
        Parses custom transcript text into sequenced Transcript segments and derives
        mock Summary, Topics, and ActionItems from the user-provided dialogue.
        """
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        participant_names = [p.name for p in participants] if participants else ["Host", "Participant"]
        if not participant_names:
            participant_names = ["Speaker 1", "Speaker 2"]

        # Parse text into lines
        raw_lines = [line.strip() for line in transcript_text.splitlines() if line.strip()]
        if not raw_lines:
            raw_lines = [transcript_text.strip()]

        total_lines = len(raw_lines)
        step_duration = max(5.0, duration / max(1, total_lines))

        transcripts = []
        action_candidates = []

        for idx, line in enumerate(raw_lines):
            # Check for "Speaker: Message" pattern
            match = re.match(r"^\[?([A-Za-z0-9_\s.-]+)\]?:\s*(.+)$", line)
            if match:
                speaker = match.group(1).strip()
                text = match.group(2).strip()
            else:
                speaker = participant_names[idx % len(participant_names)]
                text = line

            start_t = round(idx * step_duration, 1)
            end_t = round(min(float(duration), (idx + 1) * step_duration - 0.5), 1)

            t = Transcript(
                id=f"trn-{uuid.uuid4().hex[:8]}",
                meeting_id=meeting_id,
                speaker=speaker,
                start_time=start_t,
                end_time=max(start_t + 1.0, end_t),
                text=text,
                sequence_order=idx + 1,
            )
            transcripts.append(t)

            # Detect potential action item keywords in line
            if any(kw in text.lower() for kw in ["will", "action", "task", "review", "deliver", "draft", "prepare", "schedule"]):
                action_candidates.append((speaker, text))

        db.add_all(transcripts)

        # Derive Summary
        overview = (
            f"Meeting focused on {title}. Discussion between {', '.join(participant_names)} "
            f"encompassing {len(transcripts)} spoken points with actionable outcomes."
        )
        takeaways = [
            f"Addressed primary objectives for {title}.",
            f"Consensus reached on next milestones by {participant_names[0]}.",
        ]
        if action_candidates:
            takeaways.append(f"Noted follow-up: {action_candidates[0][1][:120]}")

        summary = Summary(
            id=f"sum-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            overview=overview,
            key_takeaways=json.dumps(takeaways),
            generated_at=now,
        )
        db.add(summary)

        # Derive Topics (Split evenly into 2 chapters)
        mid_time = float(duration / 2)
        top1 = Topic(
            id=f"top-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            title=f"Introduction & Scope: {title}",
            description="Opening discussion and initial alignment of requirements.",
            start_time=0.0,
            end_time=mid_time,
            sequence_order=1,
        )
        top2 = Topic(
            id=f"top-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            title=f"Decisions & Action Items: {title}",
            description="Synthesis of agreed-upon deliverables and next steps.",
            start_time=mid_time,
            end_time=float(duration),
            sequence_order=2,
        )
        db.add_all([top1, top2])

        # Derive Action Items (from candidates or fallbacks)
        if action_candidates:
            for c_idx, (speaker, text) in enumerate(action_candidates[:3]):
                act = ActionItem(
                    id=f"act-{uuid.uuid4().hex[:8]}",
                    meeting_id=meeting_id,
                    title=f"Follow up: {text[:100]}",
                    assignee=speaker,
                    completed=False,
                    created_at=now,
                )
                db.add(act)
        else:
            fallback_act = ActionItem(
                id=f"act-{uuid.uuid4().hex[:8]}",
                meeting_id=meeting_id,
                title=f"Circulate notes and sync on {title}",
                assignee=participant_names[0],
                completed=False,
                created_at=now,
            )
            db.add(fallback_act)

        db.commit()

    @staticmethod
    def _generate_mock_artifacts(db: Session, meeting_id: str, title: str, duration: int) -> None:
        """
        Simulates realistic transcripts, AI summary, topics, and action items when no transcript_text is supplied.
        """
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # 1. Summary
        summary = Summary(
            id=f"sum-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            overview=f"Comprehensive review and discussion on {title}. The team evaluated objectives, aligned on deliverable timelines, and identified key operational dependencies.",
            key_takeaways=json.dumps([
                f"Core scope established for {title}.",
                "Agreed to synchronize cross-functional initiatives prior to next milestone.",
                "Approved target completion criteria and designated primary owners.",
            ]),
            generated_at=now,
        )
        db.add(summary)

        # 2. Action Items
        item1 = ActionItem(
            id=f"act-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            title=f"Draft technical proposal and requirements for {title}",
            assignee="Elena Rostova",
            completed=False,
            created_at=now,
        )
        item2 = ActionItem(
            id=f"act-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            title="Schedule follow-up review with stakeholders",
            assignee="Marcus Chen",
            completed=True,
            created_at=now,
        )
        db.add_all([item1, item2])

        # 3. Topics
        topic1 = Topic(
            id=f"top-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            title="Kickoff & Objective Alignment",
            description="Introduced goals, review context, and expected session outcomes.",
            start_time=0.0,
            end_time=float(min(duration, 300)),
            sequence_order=1,
        )
        topic2 = Topic(
            id=f"top-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            title="Execution Plan & Timeline",
            description="Discussed deliverables, priority ranking, and technical constraints.",
            start_time=float(min(duration, 301)),
            end_time=float(duration),
            sequence_order=2,
        )
        db.add_all([topic1, topic2])

        # 4. Transcripts
        t1 = Transcript(
            id=f"trn-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            speaker="Elena Rostova",
            start_time=2.5,
            end_time=14.0,
            text=f"Welcome everyone. Today we are focusing on {title} to ensure full team alignment.",
            sequence_order=1,
        )
        t2 = Transcript(
            id=f"trn-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            speaker="Marcus Chen",
            start_time=15.2,
            end_time=29.8,
            text="Thanks Elena. I reviewed the background notes and I think our proposed milestones are achievable within the current cycle.",
            sequence_order=2,
        )
        t3 = Transcript(
            id=f"trn-{uuid.uuid4().hex[:8]}",
            meeting_id=meeting_id,
            speaker="Elena Rostova",
            start_time=31.0,
            end_time=48.5,
            text="Excellent. Let's make sure we log the follow-up tasks and sync again later this week.",
            sequence_order=3,
        )
        db.add_all([t1, t2, t3])

        db.commit()


meeting_service = MeetingService()
