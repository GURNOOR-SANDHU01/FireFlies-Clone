"""
File: backend/app/schemas/transcript.py

Purpose:
Pydantic validation and serialization schemas for transcript segments and speaker turns.

Responsibilities:
- Validate transcript segment inputs (timestamps, speaker labels, text).
- Structure serialized response models for transcript timeline navigation.

This module does NOT:
- Implement text indexing or database queries.
- Process audio streams.
"""

from typing import List
from pydantic import BaseModel, Field, ConfigDict


class TranscriptSegmentBase(BaseModel):
    speaker: str = Field(..., min_length=1, max_length=100)
    start_time: float = Field(..., ge=0.0, description="Start timestamp in seconds")
    end_time: float = Field(..., ge=0.0, description="End timestamp in seconds")
    text: str = Field(..., min_length=1, description="Transcribed spoken words")
    sequence_order: int = Field(..., ge=0, description="Sequential utterance ordering")


class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass


class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: str
    meeting_id: str

    model_config = ConfigDict(from_attributes=True)


class TranscriptListResponse(BaseModel):
    meeting_id: str
    segments: List[TranscriptSegmentResponse]
    total_segments: int
