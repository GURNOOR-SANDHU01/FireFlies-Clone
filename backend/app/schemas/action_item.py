"""
File: backend/app/schemas/action_item.py

Purpose:
Pydantic validation and serialization schemas for meeting action items.

Responsibilities:
- Validate client inputs when creating or patching an action item task.
- Provide strongly-typed response structures for action item checklist state.

This module does NOT:
- Execute SQL queries or database transactions.
- Contain route handlers.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ActionItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task summary or action item description")
    assignee: Optional[str] = Field(None, max_length=100, description="Person responsible for the task")
    due_date: Optional[datetime] = Field(None, description="Due date timestamp")


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    assignee: Optional[str] = Field(None, max_length=100)
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None


class ActionItemResponse(ActionItemBase):
    id: str
    meeting_id: str
    completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActionItemListResponse(BaseModel):
    meeting_id: str
    items: List[ActionItemResponse]
    total: int
    completed_count: int
