"""
File: backend/app/api/v1/meetings.py

Purpose:
FastAPI router for meeting lifecycle, search/filtering, topics, and summary endpoints.

Responsibilities:
- Route HTTP requests to MeetingService methods.
- Validate request bodies and query parameters with Pydantic schemas.
- Support comprehensive compound filters: search, participant, date_from, date_to, status, platform.
- Return appropriate HTTP status codes (200, 201, 204, 404, 422).
- Inject database sessions using get_db dependency.

This module does NOT:
- Execute raw SQL queries or database transactions.
- Contain business calculations or data synthesis.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse,
    MeetingListResponse,
)
from app.schemas.topic import TopicListResponse, TopicResponse
from app.schemas.summary import SummaryResponse
from app.services.meeting_service import meeting_service

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.get("", response_model=MeetingListResponse)
def list_meetings(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Max items per page"),
    search: Optional[str] = Query(None, max_length=100, description="Text search filter"),
    participant: Optional[str] = Query(None, max_length=100, description="Filter by participant name"),
    date_from: Optional[datetime] = Query(None, description="Start date filter (e.g. 2026-10-01 or ISO 8601)"),
    date_to: Optional[datetime] = Query(None, description="End date filter (e.g. 2026-10-08 or ISO 8601)"),
    status_filter: Optional[str] = Query(None, alias="status", max_length=50),
    platform: Optional[str] = Query(None, max_length=50),
    sort_by: str = Query("date", pattern="^(date|title|duration)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """
    Retrieve a paginated list of meetings matching optional filters.
    Transcripts are never loaded here for maximum dashboard performance.
    """
    # Normalize naive datetimes for SQLite comparison
    df = date_from.replace(tzinfo=None) if date_from else None
    dt = date_to.replace(tzinfo=None) if date_to else None

    # If date_to is given without explicit time (midnight), adjust to end of that day
    if dt and dt.hour == 0 and dt.minute == 0 and dt.second == 0:
        dt = dt.replace(hour=23, minute=59, second=59, microsecond=999999)

    items, total = meeting_service.list_meetings(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        participant=participant,
        date_from=df,
        date_to=dt,
        status=status_filter,
        platform=platform,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return MeetingListResponse(items=items, total=total)


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new meeting session with automatic mock transcripts, summary, and action items.
    If transcript_text is provided, derives realistic utterances, summary, topics, and actions.
    """
    return meeting_service.create_meeting(db, payload)


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve single meeting details by unique meeting_id.
    """
    meeting = meeting_service.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )
    return meeting


@router.patch("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: str,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
):
    """
    Partially update meeting title, participants, duration, status, platform, or metadata.
    """
    meeting = meeting_service.update_meeting(db, meeting_id, payload)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a meeting and all cascading child records (transcripts, action items, summary).
    """
    deleted = meeting_service.delete_meeting(db, meeting_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )
    return None


@router.get("/{meeting_id}/topics", response_model=TopicListResponse)
def get_meeting_topics(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve chronological discussion topics/chapters for a meeting.
    """
    topics = meeting_service.get_topics(db, meeting_id)
    if topics is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )
    return TopicListResponse(
        meeting_id=meeting_id,
        topics=[TopicResponse.model_validate(t) for t in topics],
        total=len(topics),
    )


@router.get("/{meeting_id}/summary", response_model=SummaryResponse)
def get_meeting_summary(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve the AI overview and key takeaways for a meeting.
    """
    summary = meeting_service.get_summary(db, meeting_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Summary for meeting with ID '{meeting_id}' was not found.",
        )
    return SummaryResponse(**summary)
