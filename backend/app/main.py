"""
File: backend/app/main.py

Purpose:
FastAPI entry point configuring middleware, route routers, exception handlers, and database lifecycle.

Responsibilities:
- Initialize the FastAPI application instance.
- Configure CORS middleware restricted to designated frontend origins.
- Mount API v1 routers for meetings, transcripts, and action items.
- Provide global exception sanitization to avoid leaking database internals.
- Expose a health check endpoint for monitoring.

This module does NOT:
- Execute SQL queries directly.
- Define ORM database models.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.meetings import router as meetings_router
from app.api.v1.transcripts import router as transcripts_router
from app.api.v1.action_items import router as action_items_router
from app.seed.seed_data import seed_database
from app.models.meeting import Meeting
from app.core.database import SessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup
    Base.metadata.create_all(bind=engine)
    # Check if empty, and auto-seed if needed for seamless dev experience
    db = SessionLocal()
    try:
        count = db.query(Meeting).count()
        if count == 0:
            print("Database is empty. Running initial development seed...")
            seed_database()
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Exception handler for request validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Invalid request payload or query parameter.",
            "errors": exc.errors(),
        },
    )


# Exception handler for unexpected errors (prevents leaking internal stack traces)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log internally in real server
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact support."},
    )


# Health check
@app.get("/health", tags=["health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Mount Routers
app.include_router(meetings_router, prefix=settings.API_V1_STR)
app.include_router(transcripts_router, prefix=settings.API_V1_STR)
app.include_router(action_items_router, prefix=settings.API_V1_STR)
