"""
File: backend/app/schemas/summary.py

Purpose:
Pydantic validation and serialization schemas for meeting AI summaries and takeaways.

Responsibilities:
- Validate structured summary input (overview paragraph, takeaways list).
- Format serialized response structures for the meeting detail summary tab.

This module does NOT:
- Execute generative LLM summarization.
- Query SQLite directly.
"""

from datetime import datetime
from typing import List
from pydantic import BaseModel, Field, ConfigDict


class SummaryBase(BaseModel):
    overview: str = Field(..., min_length=1, description="Executive narrative summary")
    key_takeaways: List[str] = Field(..., description="Bullet list of major decisions and insights")


class SummaryCreate(SummaryBase):
    pass


class SummaryResponse(SummaryBase):
    id: str
    meeting_id: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
