"""
File: backend/app/api/v1/action_items.py

Purpose:
FastAPI router for meeting action items CRUD operations.

Responsibilities:
- Route HTTP requests to MeetingService action item methods.
- Provide endpoints to list, add, update, and delete action items.
- Validate payload constraints and emit appropriate HTTP status codes (200, 201, 204, 404).

This module does NOT:
- Execute raw SQL queries.
- Contain business calculations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.action_item import (
    ActionItemCreate,
    ActionItemUpdate,
    ActionItemResponse,
    ActionItemListResponse,
)
from app.services.meeting_service import meeting_service

router = APIRouter(tags=["action-items"])


@router.get("/meetings/{meeting_id}/action-items", response_model=ActionItemListResponse)
def get_meeting_action_items(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve all action items assigned during a meeting.
    """
    items = meeting_service.get_action_items(db, meeting_id)
    if items is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )

    serialized = [ActionItemResponse.model_validate(item) for item in items]
    completed_count = sum(1 for item in serialized if item.completed)

    return ActionItemListResponse(
        meeting_id=meeting_id,
        items=serialized,
        total=len(serialized),
        completed_count=completed_count,
    )


@router.post("/meetings/{meeting_id}/action-items", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
def create_action_item(
    meeting_id: str,
    payload: ActionItemCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new action item under the specified meeting.
    """
    item = meeting_service.create_action_item(db, meeting_id, payload)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID '{meeting_id}' was not found.",
        )
    return ActionItemResponse.model_validate(item)


@router.patch("/action-items/{action_item_id}", response_model=ActionItemResponse)
def update_action_item(
    action_item_id: str,
    payload: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an action item's status, assignee, title, or due date.
    """
    item = meeting_service.update_action_item(db, action_item_id, payload)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID '{action_item_id}' was not found.",
        )
    return ActionItemResponse.model_validate(item)


@router.delete("/action-items/{action_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action_item(
    action_item_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete an action item by ID.
    """
    deleted = meeting_service.delete_action_item(db, action_item_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID '{action_item_id}' was not found.",
        )
    return None
