"""
File: backend/app/schemas/topic.py

Purpose:
Pydantic validation and serialization schemas for meeting topics and chapters.

Responsibilities:
- Validate topic creation inputs (timestamps, title, description, sequence).
- Format serialized response structures for chapter navigation in the workspace.

This module does NOT:
- Extract topics using AI.
- Query SQLite directly.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class TopicBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Topic or chapter title")
    description: Optional[str] = Field(None, description="Detailed overview of topic discussion")
    start_time: float = Field(..., ge=0.0, description="Start timestamp in seconds")
    end_time: float = Field(..., ge=0.0, description="End timestamp in seconds")
    sequence_order: int = Field(..., ge=0, description="Chronological ordering")


class TopicCreate(TopicBase):
    pass


class TopicResponse(TopicBase):
    id: str
    meeting_id: str

    model_config = ConfigDict(from_attributes=True)


class TopicListResponse(BaseModel):
    meeting_id: str
    topics: List[TopicResponse]
    total: int
