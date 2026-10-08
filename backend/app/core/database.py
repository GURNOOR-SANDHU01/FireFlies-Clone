"""
File: backend/app/core/database.py

Purpose:
SQLAlchemy database engine, session factory, and dependency injection provider.

Responsibilities:
- Configure the SQLite database engine with foreign keys enabled.
- Provide scoped sessionmaker for transactional database operations.
- Expose the declarative Base class for ORM models.
- Yield database sessions to FastAPI route dependencies via get_db().

This module does NOT:
- Define table schemas or model entities.
- Execute business queries or transactions.
"""

from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# SQLite requires check_same_thread=False for multithreaded ASGI servers
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

# Enable foreign key constraints in SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a managed SQLAlchemy database session.
    Automatically commits or rolls back, and always closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
