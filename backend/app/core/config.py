"""
File: backend/app/core/config.py

Purpose:
Application-wide configuration settings and environment variable management.

Responsibilities:
- Define strongly-typed settings using pydantic-settings.
- Resolve SQLite database path relative to backend project location rather than process working directory.
- Ensure parent data directory exists before database connection initialization.
- Configure server parameters, API prefix, and CORS origins.

This module does NOT:
- Initialize database engines or connections directly.
- Execute business logic or API routing.
"""

from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator

# Base directory for the backend package (independent of process working directory)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fireflies Clone API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # SQLite Database configuration
    BASE_DIR: Path = BASE_DIR
    DATABASE_PATH: Path = BASE_DIR / "data" / "fireflies.db"
    DATABASE_URL: Optional[str] = None

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

    @model_validator(mode="after")
    def resolve_database_paths(self) -> "Settings":
        """
        Resolves the SQLite database path relative to the backend project directory (BASE_DIR).
        Ensures the parent data directory exists prior to SQLite engine connection,
        guaranteeing reliability across local environments and cloud hosts (Render).
        """
        if not self.DATABASE_URL:
            # Default to backend/data/fireflies.db
            db_file = (self.BASE_DIR / "data" / "fireflies.db").resolve()
            self.DATABASE_PATH = db_file
            self.DATABASE_URL = f"sqlite:///{db_file}"
        elif self.DATABASE_URL.startswith("sqlite"):
            # If a custom SQLite URL was provided in environment (e.g. DATABASE_URL=sqlite:///./data/fireflies.db)
            raw_path = self.DATABASE_URL.replace("sqlite:///", "", 1)
            if raw_path and raw_path != ":memory:":
                p = Path(raw_path)
                if not p.is_absolute():
                    p = (self.BASE_DIR / p).resolve()
                self.DATABASE_PATH = p
                self.DATABASE_URL = f"sqlite:///{p}"

        # Ensure the parent data directory exists before SQLite connects
        if self.DATABASE_PATH and self.DATABASE_PATH.parent:
            self.DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

        return self


settings = Settings()
