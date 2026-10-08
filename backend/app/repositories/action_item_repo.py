"""
File: backend/app/repositories/action_item_repo.py

Purpose:
Data access layer for ActionItem entities.

Responsibilities:
- Execute raw SQLAlchemy queries for action item tasks against SQLite.
- Retrieve, persist, update, and remove action items.
- Filter action items by parent meeting ID.

This module does NOT:
- Handle HTTP routing or validation errors.
- Enforce higher-level application policies.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.action_item import ActionItem


class ActionItemRepository:
    @staticmethod
    def get_by_meeting(db: Session, meeting_id: str) -> List[ActionItem]:
        """
        Retrieves all action items associated with a given meeting.
        """
        return (
            db.query(ActionItem)
            .filter(ActionItem.meeting_id == meeting_id)
            .order_by(ActionItem.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, action_item_id: str) -> Optional[ActionItem]:
        """
        Retrieves an action item by its unique identifier.
        """
        return db.query(ActionItem).filter(ActionItem.id == action_item_id).first()

    @staticmethod
    def create(db: Session, action_item: ActionItem) -> ActionItem:
        """
        Persists a new action item to the database.
        """
        db.add(action_item)
        db.commit()
        db.refresh(action_item)
        return action_item

    @staticmethod
    def update(db: Session, action_item: ActionItem) -> ActionItem:
        """
        Flushes and commits updates to an existing action item.
        """
        db.commit()
        db.refresh(action_item)
        return action_item

    @staticmethod
    def delete(db: Session, action_item: ActionItem) -> None:
        """
        Deletes an action item from the database.
        """
        db.delete(action_item)
        db.commit()


action_item_repo = ActionItemRepository()
