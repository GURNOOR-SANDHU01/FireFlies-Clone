"""
File: backend/app/schemas/meeting.py

Purpose:
Pydantic validation and serialization schemas for meeting requests and responses.

Responsibilities:
- Validate client inputs when creating or patching a meeting.
- Define strongly-typed response structures with field constraints.
- Support both object-based and string-based participant declarations.
- Support optional transcript_text in meeting creation payloads.

This module does NOT:
- Execute database queries.
- Contain route handler logic.
"""

from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ParticipantSchema(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=150)
    is_host: Optional[bool] = False


class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Meeting title")
    date: datetime = Field(..., description="Date and time when the meeting occurred")
    duration: int = Field(0, ge=0, description="Meeting duration in seconds")
    platform: str = Field("google_meet", max_length=50, description="google_meet, zoom, teams, in_person, audio_upload")
    status: str = Field("completed", max_length=50, description="completed, processing, scheduled")
    audio_url: Optional[str] = Field(None, max_length=512)


class MeetingCreate(MeetingBase):
    participants: Optional[List[Union[ParticipantSchema, str]]] = Field(
        default_factory=list,
        description="List of participants as objects or simple name strings"
    )
    transcript_text: Optional[str] = Field(
        None,
        description="Optional raw transcript text for parsing speaker turns and generating artifacts"
    )

    @field_validator("participants", mode="before")
    @classmethod
    def normalize_participants(cls, v):
        if not v:
            return []
        normalized = []
        for item in v:
            if isinstance(item, str):
                normalized.append(ParticipantSchema(name=item.strip()))
            elif isinstance(item, dict):
                normalized.append(ParticipantSchema(**item))
            elif isinstance(item, ParticipantSchema):
                normalized.append(item)
        return normalized


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    date: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=0)
    platform: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    audio_url: Optional[str] = Field(None, max_length=512)
    participants: Optional[List[Union[ParticipantSchema, str]]] = None

    @field_validator("participants", mode="before")
    @classmethod
    def normalize_update_participants(cls, v):
        if v is None:
            return None
        normalized = []
        for item in v:
            if isinstance(item, str):
                normalized.append(ParticipantSchema(name=item.strip()))
            elif isinstance(item, dict):
                normalized.append(ParticipantSchema(**item))
            elif isinstance(item, ParticipantSchema):
                normalized.append(item)
        return normalized


class MeetingResponse(MeetingBase):
    id: str
    has_transcript: bool
    participants: List[ParticipantSchema] = Field(default_factory=list)
    action_items_count: int = 0
    completed_action_items_count: int = 0
    transcript_segments_count: int = 0
    summary_preview: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeetingListResponse(BaseModel):
    items: List[MeetingResponse]
    total: int
