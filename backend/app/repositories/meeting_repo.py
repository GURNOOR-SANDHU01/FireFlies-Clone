"""
File: backend/app/repositories/meeting_repo.py

Purpose:
High-performance data access layer for Meeting, Transcript, Topic, and Summary entities.

Responsibilities:
- Execute optimized SQLAlchemy queries against SQLite.
- Apply compound filters (search, participant, date ranges, status, platform).
- Compute action item and transcript counts via SQL scalar subqueries to avoid N+1 queries
  and eliminate cartesian product joins.
- Guarantee that transcript segments are NEVER loaded during dashboard list operations.
- Provide targeted query methods for single meeting lookup, topics, summary, and transcripts.

This module does NOT:
- Handle HTTP requests, responses, or status codes.
- Validate business workflows (delegated to services/meeting_service.py).
"""

from datetime import datetime
from typing import List, Optional, Tuple, Any
from sqlalchemy import or_, and_, desc, asc, func, select
from sqlalchemy.orm import Session, joinedload
from app.models.meeting import Meeting
from app.models.transcript import Transcript
from app.models.topic import Topic
from app.models.summary import Summary
from app.models.action_item import ActionItem


class MeetingRepository:
    @staticmethod
    def get_meetings(
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
    ) -> Tuple[List[Tuple[Meeting, int, int, int]], int]:
        """
        Retrieves paginated meetings using SQL scalar subqueries for counts.
        
        PERFORMANCE ARCHITECTURE:
        - Transcripts are NEVER loaded in this query. Large transcripts remain in storage
          until explicitly requested by the meeting workspace detail endpoint.
        - Action item counts and transcript utterance counts are computed directly inside
          SQLite via scalar subqueries. This prevents cartesian-product joins between
          transcripts and action items, keeping the result set exactly 1 row per meeting.
        - Summary is loaded via joinedload because it is a 1-to-1 relationship.
        """
        # 1. Define scalar subqueries for aggregate counts
        action_count_subq = (
            select(func.count(ActionItem.id))
            .where(ActionItem.meeting_id == Meeting.id)
            .scalar_subquery()
        )

        completed_action_count_subq = (
            select(func.count(ActionItem.id))
            .where(and_(ActionItem.meeting_id == Meeting.id, ActionItem.completed == True))  # noqa: E712
            .scalar_subquery()
        )

        transcript_count_subq = (
            select(func.count(Transcript.id))
            .where(Transcript.meeting_id == Meeting.id)
            .scalar_subquery()
        )

        # 2. Build base query with summary preloaded
        query = db.query(
            Meeting,
            action_count_subq.label("action_items_count"),
            completed_action_count_subq.label("completed_action_items_count"),
            transcript_count_subq.label("transcript_segments_count"),
        ).options(
            joinedload(Meeting.summary)
        )

        # 3. Apply Filters
        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Meeting.title).like(term),
                    func.lower(Meeting.participants).like(term),
                )
            )

        if participant and participant.strip():
            p_term = f"%{participant.strip().lower()}%"
            query = query.filter(func.lower(Meeting.participants).like(p_term))

        if date_from:
            query = query.filter(Meeting.date >= date_from)

        if date_to:
            query = query.filter(Meeting.date <= date_to)

        if status and status != "all":
            query = query.filter(Meeting.status == status)

        if platform and platform != "all":
            query = query.filter(Meeting.platform == platform)

        # 4. Total count of filtered records
        total = query.count()

        # 5. Sorting
        sort_col = getattr(Meeting, sort_by, Meeting.date)
        order_fn = desc if sort_order.lower() == "desc" else asc
        query = query.order_by(order_fn(sort_col))

        # 6. Pagination
        results = query.offset(skip).limit(limit).all()
        return results, total

    @staticmethod
    def get_by_id(db: Session, meeting_id: str) -> Optional[Meeting]:
        """
        Retrieves a single meeting by its ID with summary preloaded.
        Transcripts, topics, and action items are fetched through their dedicated queries.
        """
        return (
            db.query(Meeting)
            .options(
                joinedload(Meeting.summary),
            )
            .filter(Meeting.id == meeting_id)
            .first()
        )

    @staticmethod
    def create(db: Session, meeting: Meeting) -> Meeting:
        """
        Persists a new meeting record.
        """
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        return meeting

    @staticmethod
    def update(db: Session, meeting: Meeting) -> Meeting:
        """
        Flushes and commits updates to an existing meeting record.
        """
        db.commit()
        db.refresh(meeting)
        return meeting

    @staticmethod
    def delete(db: Session, meeting: Meeting) -> None:
        """
        Deletes a meeting record (cascading deletes child entities).
        """
        db.delete(meeting)
        db.commit()

    @staticmethod
    def get_transcripts(db: Session, meeting_id: str) -> List[Transcript]:
        """
        Retrieves all ordered transcript segments for a meeting.
        """
        return (
            db.query(Transcript)
            .filter(Transcript.meeting_id == meeting_id)
            .order_by(Transcript.sequence_order.asc())
            .all()
        )

    @staticmethod
    def get_topics(db: Session, meeting_id: str) -> List[Topic]:
        """
        Retrieves all chronological topics/chapters for a meeting.
        """
        return (
            db.query(Topic)
            .filter(Topic.meeting_id == meeting_id)
            .order_by(Topic.sequence_order.asc())
            .all()
        )

    @staticmethod
    def get_summary(db: Session, meeting_id: str) -> Optional[Summary]:
        """
        Retrieves the AI summary for a meeting.
        """
        return db.query(Summary).filter(Summary.meeting_id == meeting_id).first()


meeting_repo = MeetingRepository()
