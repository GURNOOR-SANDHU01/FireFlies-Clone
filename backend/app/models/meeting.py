"""
File: backend/app/models/meeting.py

Purpose:
SQLAlchemy ORM model representing a meeting session.

Responsibilities:
- Define database table schema for 'meetings'.
- Map columns for title, date, duration, platform, status, and metadata.
- Establish cascade relationships with transcripts, action items, topics, and summary.

This module does NOT:
- Validate API request bodies (delegated to schemas/meeting.py).
- Execute SQL queries or database transactions.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    duration = Column(Integer, nullable=False, default=0)  # in seconds
    participants = Column(Text, nullable=True)  # JSON-serialized list of participant objects/names
    platform = Column(String(50), nullable=False, default="google_meet", index=True)
    status = Column(String(50), nullable=False, default="completed", index=True)
    has_transcript = Column(Boolean, nullable=False, default=True)
    audio_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships with cascading deletes
    transcripts = relationship(
        "Transcript",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Transcript.sequence_order",
    )
    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan",
    )
    topics = relationship(
        "Topic",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Topic.sequence_order",
    )
    summary = relationship(
        "Summary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan",
    )
