"""
File: backend/app/models/__init__.py

Purpose:
Aggregates and exposes all SQLAlchemy ORM models for metadata binding and imports.

Responsibilities:
- Export Meeting, Transcript, ActionItem, Topic, and Summary models.

This module does NOT:
- Execute SQL statements directly.
"""

from app.models.meeting import Meeting
from app.models.transcript import Transcript
from app.models.action_item import ActionItem
from app.models.topic import Topic
from app.models.summary import Summary

__all__ = [
    "Meeting",
    "Transcript",
    "ActionItem",
    "Topic",
    "Summary",
]
