"""
File: backend/app/core/config.py

Purpose:
Application-wide configuration settings and environment variable management.

Responsibilities:
- Define strongly-typed settings using pydantic-settings.
- Configure SQLite database path, API prefix, and server parameters.
- Restrict CORS origins to authorized frontend environments.

This module does NOT:
- Initialize database engines or connections directly.
- Execute business logic or API routing.
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fireflies Clone API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # SQLite Database configuration
    DATABASE_PATH: Path = BASE_DIR / "data" / "fireflies.db"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/fireflies.db"

    # Narrow CORS configuration for Next.js frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
