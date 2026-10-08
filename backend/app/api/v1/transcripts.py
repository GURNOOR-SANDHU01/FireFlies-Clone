"""
File: backend/app/api/v1/transcripts.py

Purpose:
FastAPI router for meeting transcript segments and speaker turns.

Responsibilities:
- Route HTTP requests to MeetingService transcript methods.
- Return ordered transcript segments for playback synchronization.
- Handle 404 responses when meeting ID is non-existent.

This module does NOT:
- Execute audio processing or direct SQL queries.
- Format frontend UI components.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.transcript import (
    TranscriptListResponse,
    TranscriptSegmentResponse,
)
from app.services.meeting_service import meeting_service

router = APIRouter(prefix="/meetings", tags=["transcripts"])


@router.get("/{meeting_id}/transcript", response_model=TranscriptListResponse)
def get_meeting_transcript(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve all ordered transcript utterances for a given meeting.
    """
    segments = meeting_service.get_transcripts(db, meeting_id)
    if segments is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )

    serialized = [TranscriptSegmentResponse.model_validate(seg) for seg in segments]
    return TranscriptListResponse(
        meeting_id=meeting_id,
        segments=serialized,
        total_segments=len(serialized),
    )
