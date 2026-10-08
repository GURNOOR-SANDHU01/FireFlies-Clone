"""
File: backend/app/schemas/__init__.py

Purpose:
Aggregates and exposes all Pydantic schemas for the API layer.

Responsibilities:
- Re-export schemas for meeting, transcript, action item, topic, and summary domains.

This module does NOT:
- Implement data processing logic.
"""

from app.schemas.meeting import (
    ParticipantSchema,
    MeetingBase,
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse,
    MeetingListResponse,
)
from app.schemas.transcript import (
    TranscriptSegmentBase,
    TranscriptSegmentCreate,
    TranscriptSegmentResponse,
    TranscriptListResponse,
)
from app.schemas.action_item import (
    ActionItemBase,
    ActionItemCreate,
    ActionItemUpdate,
    ActionItemResponse,
    ActionItemListResponse,
)
from app.schemas.topic import (
    TopicBase,
    TopicCreate,
    TopicResponse,
    TopicListResponse,
)
from app.schemas.summary import (
    SummaryBase,
    SummaryCreate,
    SummaryResponse,
)

__all__ = [
    "ParticipantSchema",
    "MeetingBase",
    "MeetingCreate",
    "MeetingUpdate",
    "MeetingResponse",
    "MeetingListResponse",
    "TranscriptSegmentBase",
    "TranscriptSegmentCreate",
    "TranscriptSegmentResponse",
    "TranscriptListResponse",
    "ActionItemBase",
    "ActionItemCreate",
    "ActionItemUpdate",
    "ActionItemResponse",
    "ActionItemListResponse",
    "TopicBase",
    "TopicCreate",
    "TopicResponse",
    "TopicListResponse",
    "SummaryBase",
    "SummaryCreate",
    "SummaryResponse",
]
