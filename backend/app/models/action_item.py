"""
File: backend/app/models/action_item.py

Purpose:
SQLAlchemy ORM model representing actionable tasks assigned from a meeting.

Responsibilities:
- Define database table schema for 'action_items'.
- Store task title/description, assignee, due date, completion status, and timestamp.
- Establish foreign key relationship back to the parent meeting.

This module does NOT:
- Handle HTTP requests or user input validation.
- Execute SQL queries directly.
"""

from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String(64), primary_key=True, index=True)
    meeting_id = Column(String(64), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    assignee = Column(String(100), nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship back to parent meeting
    meeting = relationship("Meeting", back_populates="action_items")
