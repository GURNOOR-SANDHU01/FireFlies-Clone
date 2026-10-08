"""
File: backend/app/models/transcript.py

Purpose:
SQLAlchemy ORM model representing individual spoken transcript segments.

Responsibilities:
- Define database table schema for 'transcripts'.
- Store speaker label, timestamps (start_time, end_time), text, and sequence order.
- Establish foreign key relationship back to the parent meeting.

This module does NOT:
- Perform audio-to-text transcription or diarization.
- Implement search match algorithms.
"""

from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(64), primary_key=True, index=True)
    meeting_id = Column(String(64), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String(100), nullable=False)
    start_time = Column(Float, nullable=False, index=True)  # in seconds
    end_time = Column(Float, nullable=False)                # in seconds
    text = Column(Text, nullable=False)
    sequence_order = Column(Integer, nullable=False, index=True)

    # Relationship back to parent meeting
    meeting = relationship("Meeting", back_populates="transcripts")
