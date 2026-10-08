"""
File: backend/app/models/topic.py

Purpose:
SQLAlchemy ORM model representing meeting agenda topics or discussion chapters.

Responsibilities:
- Define database table schema for 'topics'.
- Store chapter title, description, time boundaries (start_time, end_time), and sequence order.
- Establish foreign key relationship back to the parent meeting.

This module does NOT:
- Extract topics using AI or natural language models.
- Handle API request serialization.
"""

from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(64), primary_key=True, index=True)
    meeting_id = Column(String(64), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(Float, nullable=False)  # in seconds
    end_time = Column(Float, nullable=False)    # in seconds
    sequence_order = Column(Integer, nullable=False, index=True)

    # Relationship back to parent meeting
    meeting = relationship("Meeting", back_populates="topics")
