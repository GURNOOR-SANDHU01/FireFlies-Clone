"""
File: backend/app/seed/seed_data.py

Purpose:
Standalone database seeding module for initializing realistic sample data.

Responsibilities:
- Create database tables using SQLAlchemy Base.metadata.
- Populate SQLite database with comprehensive sample meetings.
- Provide rich transcript segments, speaker timestamps, AI summaries, action items, and topic chapters.
- Support both programmatic invocation and CLI execution.

This module does NOT:
- Expose HTTP API routes.
- Execute as part of the normal production request lifecycle.
"""

import json
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.meeting import Meeting
from app.models.transcript import Transcript
from app.models.action_item import ActionItem
from app.models.topic import Topic
from app.models.summary import Summary


def seed_database():
    """
    Initializes tables and seeds rich sample meetings with full relational graphs.
    """
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_count = db.query(Meeting).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} meetings. Clearing existing data for fresh seed...")
            db.query(Transcript).delete()
            db.query(ActionItem).delete()
            db.query(Topic).delete()
            db.query(Summary).delete()
            db.query(Meeting).delete()
            db.commit()

        base_time = datetime(2026, 10, 7, 14, 30, 0)

        # -------------------------------------------------------------
        # Meeting 1: Product Strategy & Q4 Roadmap Alignment
        # -------------------------------------------------------------
        m1 = Meeting(
            id="meet-001",
            title="Product Strategy & Q4 Roadmap Alignment",
            date=base_time,
            duration=1845,
            platform="google_meet",
            status="completed",
            audio_url="/audio/product_strategy_sample.mp3",
            participants=json.dumps([
                {"id": "att-1", "name": "Elena Rostova", "email": "elena@fireflies.ai", "is_host": True},
                {"id": "att-2", "name": "Marcus Chen", "email: ": "marcus@fireflies.ai", "is_host": False},
                {"id": "att-3", "name": "Aaliyah Patel", "email": "aaliyah@fireflies.ai", "is_host": False},
                {"id": "att-4", "name": "David Kim", "email": "david@fireflies.ai", "is_host": False},
            ]),
            has_transcript=True,
            created_at=base_time - timedelta(minutes=30),
            updated_at=base_time + timedelta(minutes=45),
        )
        db.add(m1)

        # M1 Summary
        s1 = Summary(
            id="sum-001",
            meeting_id="meet-001",
            overview="The product and engineering leadership team reviewed Q3 performance metrics and aligned on the primary Q4 roadmap milestones. The core strategic focus is reducing audio transcription latency, improving speaker diarization accuracy in noisy environments, and launching enterprise workspace controls.",
            key_takeaways=json.dumps([
                "Prioritize sub-second streaming transcription over batch processing for all enterprise tier calls.",
                "Marcus will deliver the revised API specifications and benchmark suite by Friday afternoon.",
                "Elena confirmed additional engineering headcount allocations approved by finance.",
                "Aaliyah will prepare customer rollout briefs for top design partners before next sprint.",
            ]),
            generated_at=base_time + timedelta(minutes=35),
        )
        db.add(s1)

        # M1 Action Items
        actions_m1 = [
            ActionItem(
                id="act-001",
                meeting_id="meet-001",
                title="Draft OpenAPI specification for real-time audio chunking",
                assignee="Marcus Chen",
                due_date=base_time + timedelta(days=3),
                completed=True,
                created_at=base_time,
            ),
            ActionItem(
                id="act-002",
                meeting_id="meet-001",
                title="Finalize Q4 engineering headcount hiring plan with Finance",
                assignee="Elena Rostova",
                due_date=base_time + timedelta(days=5),
                completed=True,
                created_at=base_time,
            ),
            ActionItem(
                id="act-003",
                meeting_id="meet-001",
                title="Share early enterprise feedback deck with customer advisory council",
                assignee="Aaliyah Patel",
                due_date=base_time + timedelta(days=7),
                completed=False,
                created_at=base_time,
            ),
            ActionItem(
                id="act-004",
                meeting_id="meet-001",
                title="Run benchmark tests on diarization latency improvements",
                assignee="David Kim",
                due_date=base_time + timedelta(days=4),
                completed=False,
                created_at=base_time,
            ),
        ]
        db.add_all(actions_m1)

        # M1 Topics
        topics_m1 = [
            Topic(
                id="top-001",
                meeting_id="meet-001",
                title="Q3 Review & Retention Highlights",
                description="Evaluation of user retention trends, weekly active meeting volumes, and summary engagement rates.",
                start_time=0.0,
                end_time=380.0,
                sequence_order=1,
            ),
            Topic(
                id="top-002",
                meeting_id="meet-001",
                title="Q4 Architecture & Latency Objectives",
                description="Technical analysis of sub-second streaming diarization versus standard chunked Whisper pipelines.",
                start_time=381.0,
                end_time=1140.0,
                sequence_order=2,
            ),
            Topic(
                id="top-003",
                meeting_id="meet-001",
                title="Resource Allocation & Next Steps",
                description="Confirming project owners, delivery milestones, and stakeholder communication cadences.",
                start_time=1141.0,
                end_time=1845.0,
                sequence_order=3,
            ),
        ]
        db.add_all(topics_m1)

        # M1 Transcripts
        transcripts_m1 = [
            Transcript(
                id="trn-001",
                meeting_id="meet-001",
                speaker="Elena Rostova",
                start_time=0.0,
                end_time=14.5,
                text="Welcome everyone to our Q4 product alignment session. Today our main agenda is locking down the technical priorities for the upcoming quarter.",
                sequence_order=1,
            ),
            Transcript(
                id="trn-002",
                meeting_id="meet-001",
                speaker="Marcus Chen",
                start_time=15.0,
                end_time=36.8,
                text="Thanks Elena. Looking at our Q3 metrics, the feature that drove our highest retention was automated action items and smart chapter navigation.",
                sequence_order=2,
            ),
            Transcript(
                id="trn-003",
                meeting_id="meet-001",
                speaker="Aaliyah Patel",
                start_time=37.2,
                end_time=58.0,
                text="I completely agree Marcus. Customers specifically told us they love opening the meeting workspace directly during calls to see action items sync in real time.",
                sequence_order=3,
            ),
            Transcript(
                id="trn-004",
                meeting_id="meet-001",
                speaker="David Kim",
                start_time=59.0,
                end_time=86.4,
                text="On the infrastructure side, the biggest opportunity is reducing the transcription latency. Currently, processing takes roughly 20 percent of call length.",
                sequence_order=4,
            ),
            Transcript(
                id="trn-005",
                meeting_id="meet-001",
                speaker="Elena Rostova",
                start_time=87.0,
                end_time=112.5,
                text="That's a huge point David. If we can get speaker diarization running in near real time, users can search spoken quotes while the meeting is still happening.",
                sequence_order=5,
            ),
            Transcript(
                id="trn-006",
                meeting_id="meet-001",
                speaker="Marcus Chen",
                start_time=113.0,
                end_time=142.2,
                text="I've already started drafting the architecture spec. We can decouple the audio streaming buffer from the text summarizer to keep latency under 800 milliseconds.",
                sequence_order=6,
            ),
            Transcript(
                id="trn-007",
                meeting_id="meet-001",
                speaker="Elena Rostova",
                start_time=143.0,
                end_time=168.0,
                text="Perfect. Let's make sure that spec is circulated by Friday. What about our enterprise permission model?",
                sequence_order=7,
            ),
            Transcript(
                id="trn-008",
                meeting_id="meet-001",
                speaker="Aaliyah Patel",
                start_time=169.0,
                end_time=198.5,
                text="Enterprise admins want granular controls over who can edit action items and export transcripts. I'll outline the permission tiers by next week.",
                sequence_order=8,
            ),
            Transcript(
                id="trn-009",
                meeting_id="meet-001",
                speaker="David Kim",
                start_time=199.0,
                end_time=228.0,
                text="I will spin up test benchmarks for the audio seek bar synchronization to verify timestamps match utterance boundaries precisely.",
                sequence_order=9,
            ),
            Transcript(
                id="trn-010",
                meeting_id="meet-001",
                speaker="Elena Rostova",
                start_time=229.0,
                end_time=250.0,
                text="Sounds like a great consensus. Let's wrap up, record these action items in the workspace, and regroup on Tuesday.",
                sequence_order=10,
            ),
        ]
        db.add_all(transcripts_m1)

        # -------------------------------------------------------------
        # Meeting 2: AI Pipeline Architecture & Speech Model Benchmarks
        # -------------------------------------------------------------
        m2 = Meeting(
            id="meet-002",
            title="AI Pipeline Architecture & Speech Model Benchmarks",
            date=base_time - timedelta(days=1, hours=4),
            duration=2520,
            platform="zoom",
            status="completed",
            audio_url="/audio/pipeline_benchmarks.mp3",
            participants=json.dumps([
                {"id": "att-2", "name": "Marcus Chen", "email": "marcus@fireflies.ai", "is_host": True},
                {"id": "att-5", "name": "Sophia Becker", "email": "sophia@fireflies.ai", "is_host": False},
                {"id": "att-6", "name": "Tariq Johnson", "email": "tariq@fireflies.ai", "is_host": False},
            ]),
            has_transcript=True,
            created_at=base_time - timedelta(days=1, hours=5),
            updated_at=base_time - timedelta(days=1, hours=3),
        )
        db.add(m2)

        s2 = Summary(
            id="sum-002",
            meeting_id="meet-002",
            overview="Technical deep-dive on diarization accuracy, Whisper fine-tuning latency, and fallback mechanisms for noisy audio. The engineering team evaluated benchmark runs across enterprise sample calls and approved decoupling the diarization model from LLM summarization.",
            key_takeaways=json.dumps([
                "Decoupling speaker diarization reduces time-to-first-token by 35%.",
                "Sophia will set up automated accuracy metrics using word-error-rate (WER) thresholds.",
                "Tariq will finalize the fallback queue for intermittent network drops.",
            ]),
            generated_at=base_time - timedelta(days=1, hours=3),
        )
        db.add(s2)

        actions_m2 = [
            ActionItem(
                id="act-005",
                meeting_id="meet-002",
                title="Deploy WER benchmarking suite to staging environment",
                assignee="Sophia Becker",
                due_date=base_time + timedelta(days=2),
                completed=False,
                created_at=base_time - timedelta(days=1),
            ),
            ActionItem(
                id="act-006",
                meeting_id="meet-002",
                title="Implement exponential backoff retry for failed transcript chunks",
                assignee="Tariq Johnson",
                due_date=base_time + timedelta(days=4),
                completed=True,
                created_at=base_time - timedelta(days=1),
            ),
        ]
        db.add_all(actions_m2)

        topics_m2 = [
            Topic(
                id="top-004",
                meeting_id="meet-002",
                title="Acoustic Model Comparisons",
                description="Benchmarked Whisper large-v3 vs distilled variants on corporate meeting audio.",
                start_time=0.0,
                end_time=980.0,
                sequence_order=1,
            ),
            Topic(
                id="top-005",
                meeting_id="meet-002",
                title="Diarization & Overlapping Speech",
                description="Handling multi-speaker interruptions and speaker label continuity.",
                start_time=981.0,
                end_time=2520.0,
                sequence_order=2,
            ),
        ]
        db.add_all(topics_m2)

        transcripts_m2 = [
            Transcript(
                id="trn-011",
                meeting_id="meet-002",
                speaker="Marcus Chen",
                start_time=0.0,
                end_time=18.0,
                text="Let's review the benchmark results for our speech pipeline. Sophia, how did the multi-speaker accuracy hold up?",
                sequence_order=1,
            ),
            Transcript(
                id="trn-012",
                meeting_id="meet-002",
                speaker="Sophia Becker",
                start_time=19.0,
                end_time=48.5,
                text="The word error rate improved to 4.2% across clean acoustic streams, but degraded to 9.8% during overlapping dialogue segments.",
                sequence_order=2,
            ),
            Transcript(
                id="trn-013",
                meeting_id="meet-002",
                speaker="Tariq Johnson",
                start_time=49.0,
                end_time=77.0,
                text="Adding a second-pass speaker verification filter cleaned up the boundary bleeding significantly without incurring heavy CPU overhead.",
                sequence_order=3,
            ),
        ]
        db.add_all(transcripts_m2)

        # -------------------------------------------------------------
        # Meeting 3: Customer Advisory Board: Enterprise Workspace Feedback
        # -------------------------------------------------------------
        m3 = Meeting(
            id="meet-003",
            title="Customer Advisory Board: Enterprise Workspace Feedback",
            date=base_time - timedelta(days=2, hours=2),
            duration=3180,
            platform="teams",
            status="completed",
            audio_url="/audio/customer_feedback.mp3",
            participants=json.dumps([
                {"id": "att-1", "name": "Elena Rostova", "email": "elena@fireflies.ai", "is_host": True},
                {"id": "att-7", "name": "Rachel Vance", "email": "rachel@acmeworks.com", "is_host": False},
                {"id": "att-8", "name": "Bruce Wayne", "email": "bruce@waynetech.com", "is_host": False},
            ]),
            has_transcript=True,
            created_at=base_time - timedelta(days=2, hours=3),
            updated_at=base_time - timedelta(days=2, hours=1),
        )
        db.add(m3)

        s3 = Summary(
            id="sum-003",
            meeting_id="meet-003",
            overview="Quarterly feedback session with enterprise design partners Acme Corp and Wayne Enterprises. Highlighted positive adoption of automated summaries while gathering requests for single-click transcript exports and Slack action-item syncing.",
            key_takeaways=json.dumps([
                "Acme Corp requested webhook triggers when action items are created.",
                "Wayne Enterprises requested SOC2 compliant retention policies for recorded audio files.",
                "Strong praise for the interactive seek bar audio scrub synchronization.",
            ]),
            generated_at=base_time - timedelta(days=2, hours=1),
        )
        db.add(s3)

        actions_m3 = [
            ActionItem(
                id="act-007",
                meeting_id="meet-003",
                title="Prepare SOC2 data retention compliance documentation",
                assignee="Elena Rostova",
                due_date=base_time + timedelta(days=6),
                completed=True,
                created_at=base_time - timedelta(days=2),
            ),
            ActionItem(
                id="act-008",
                meeting_id="meet-003",
                title="Design webhook notification payload for action item triggers",
                assignee="Marcus Chen",
                due_date=base_time + timedelta(days=8),
                completed=True,
                created_at=base_time - timedelta(days=2),
            ),
        ]
        db.add_all(actions_m3)

        topics_m3 = [
            Topic(
                id="top-006",
                meeting_id="meet-003",
                title="Enterprise Security & Retention",
                description="Review of security standards, encryption at rest, and audit logs.",
                start_time=0.0,
                end_time=1200.0,
                sequence_order=1,
            ),
            Topic(
                id="top-007",
                meeting_id="meet-003",
                title="Integrations & Workflow Automation",
                description="Discussion on Slack notifications, CRM sync, and Jira export.",
                start_time=1201.0,
                end_time=3180.0,
                sequence_order=2,
            ),
        ]
        db.add_all(topics_m3)

        transcripts_m3 = [
            Transcript(
                id="trn-014",
                meeting_id="meet-003",
                speaker="Rachel Vance",
                start_time=0.0,
                end_time=24.0,
                text="Our team has been using the Fireflies workspace across all product syncs, and the automated action item assignment has saved us hours every week.",
                sequence_order=1,
            ),
            Transcript(
                id="trn-015",
                meeting_id="meet-003",
                speaker="Elena Rostova",
                start_time=25.0,
                end_time=45.0,
                text="That is wonderful to hear Rachel. How has your experience been with searching through past transcripts?",
                sequence_order=2,
            ),
            Transcript(
                id="trn-016",
                meeting_id="meet-003",
                speaker="Bruce Wayne",
                start_time=46.0,
                end_time=72.0,
                text="The search highlighting works reliably. When someone mentions a keyword, clicking the timestamp takes you right to the exact second in the audio.",
                sequence_order=3,
            ),
        ]
        db.add_all(transcripts_m3)

        db.commit()
        print("✓ Database successfully initialized and seeded with 3 comprehensive meeting sessions.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
