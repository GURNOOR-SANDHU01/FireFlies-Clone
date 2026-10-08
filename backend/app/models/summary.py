"""
File: backend/app/models/summary.py

Purpose:
SQLAlchemy ORM model representing executive meeting summary and takeaways.

Responsibilities:
- Define database table schema for 'summaries'.
- Store executive overview narrative and key takeaways list (as JSON text).
- Establish unique one-to-one foreign key relationship with the parent meeting.

This module does NOT:
- Call external generative AI services.
- Manage HTTP response models.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String(64), primary_key=True, index=True)
    meeting_id = Column(String(64), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    overview = Column(Text, nullable=False)
    key_takeaways = Column(Text, nullable=False)  # JSON-serialized list of strings
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship back to parent meeting
    meeting = relationship("Meeting", back_populates="summary")
