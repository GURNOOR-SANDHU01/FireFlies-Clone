# Fireflies.ai Clone — Meeting Intelligence Platform

A functional full-stack meeting intelligence application inspired by Fireflies.ai, built as a pair-programming assignment. The application enables users to manage recorded meetings, inspect time-synchronized audio transcripts with speaker diarization, review executive summaries and key takeaways, navigate chaptered discussion topics, and track actionable tasks.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Seed / Mock Data](#8-seed--mock-data)
9. [Running Locally](#9-running-locally)
10. [Assumptions & Out of Scope](#10-assumptions--out-of-scope)
11. [Assignment Notes](#11-assignment-notes)

---

## 1. Project Overview

This repository implements a functional **Fireflies.ai clone** delivering an end-to-end meeting intelligence experience. 

In enterprise workflows, meetings often yield hours of unsearchable recordings and forgotten commitments. This application solves that problem by:
- Organizing recorded conversations in a central dashboard with multi-criteria filtering and metrics.
- Synchronizing interactive, diarized transcripts with audio playback.
- Surfacing structured AI-style summaries, bulleted takeaways, and chapter topics.
- Managing meeting action items with inline editing, assignment tracking, and completion toggles.

The project features a decoupled architecture connecting a **Next.js (React & TypeScript)** frontend with a **Python (FastAPI & SQLAlchemy)** backend powered by a local **SQLite** database.

---

## 2. Features

All documented features are fully implemented and verified in the codebase:

### Meetings Dashboard
- **Meeting List & Metric Cards:** Displays all recorded meetings alongside summary metrics (total meetings count, total recording hours/minutes, active action item counts).
- **Search & Compound Filters:** Instant search by title or keywords, plus server-supported compound filtering by participant name, date range (`date_from`, `date_to`), platform (`Google Meet`, `Zoom`, `Microsoft Teams`), and status (`completed`, `in_progress`, `scheduled`).
- **Multi-Field Sorting:** Server-backed sorting by meeting date, title, or duration in ascending or descending order.
- **Optimized Payloads:** The meetings list endpoint omits heavy transcript bodies, returning lightweight metadata and child-record count subqueries for instant rendering.

### Meeting Management (CRUD)
- **Meeting Creation:** Modal workflow to create a meeting with custom metadata (title, date, duration, platform, participants). If a raw transcript script is pasted, the backend automatically derives diarized speaker segments, an executive overview, topic chapters, and action items.
- **Metadata Editing:** Edit meeting title and participant lists (names, emails, host status) directly from the meeting detail workspace.
- **Meeting Deletion:** Deletion modal with automatic cascading delete of all child transcripts, summaries, topics, and action items, followed by a redirect to the dashboard.

### Meeting Detail Workspace
- **Three-Column / Responsive Split Layout:** Displays discussion chapters and participants in a left sidebar, interactive transcript in the center, and executive summary alongside action items in the right panel.
- **Persistent Header Navigation:** Displays platform badge, meeting status, date, duration, back navigation, and inline metadata edit actions.

### Interactive Transcript & Audio Player
- **Speaker Diarization & Timestamps:** Chronological utterances labeled by speaker with color-coded avatar initials and exact `mm:ss` timestamps.
- **Audio / Media Player:** Audio player supporting Play/Pause, 5-second skip backward/forward, scrub slider, volume adjustment with mute toggle, and variable playback speeds (0.75x, 1x, 1.25x, 1.5x, 2x). Includes fallback timer playback when static audio media is not present.
- **Transcript ↔ Playback Synchronization:** As audio plays, the active transcript segment highlights in real-time and smoothly scrolls into viewport view. Clicking any timestamp or utterance instantly seeks the audio player to that exact time.
- **Transcript Search & In-Page Highlighting:** Dedicated in-transcript search bar that highlights matching search terms, reports total match count, and provides Next/Previous match navigation buttons.

### Meeting Intelligence Artifacts
- **AI-Generated / Mock Summary:** Executive overview paragraph synthesizing key discussion points.
- **Key Takeaways:** Bulleted strategic takeaways summarizing outcomes and decisions.
- **Topics / Discussion Chapters:** Chronological agenda segments with titles, descriptions, and clickable timestamp ranges that seek audio to the chapter start.

### Action Items Management
- **Full Action Item CRUD:** View assigned tasks, create new action items with assignee and due date, edit item titles/assignees inline, and delete items.
- **Interactive Completion:** Checkbox toggling updates completion state immediately on the frontend and persists the change to the backend SQLite database.
- **Task Metrics:** Displays total task counts and completed items with visual progress.

### UI & Layout Polishing
- **Toast Notifications:** Non-intrusive feedback toasts for meeting creation, metadata saves, item deletion, and link copying.
- **Modern Dark UI Design:** Tailored CSS design tokens (slate/dark palette, glassmorphism card surfaces, accessible typography, zero heavy UI component library bloat).
- **Responsive Navigation:** Collapsible sidebar with active route detection (`/` and `/meetings/[id]`).

---

## 3. Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) 16.4.0 (App Router, Turbopack)
- **Library:** [React](https://react.dev/) 19.3.0
- **Language:** [TypeScript](https://www.typescriptlang.org/) 5.x
- **Styling:** Modern Native CSS / CSS Tokens (`src/app/globals.css`), responsive flexbox/grid layout, dark theme
- **HTTP Client:** Native Web `fetch` API (no Axios dependency)

### Backend
- **Language:** Python 3.10+
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) 0.115+
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/) 0.32+
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) 2.0+ (pure ORM, no SQLModel)
- **Data Validation:** [Pydantic](https://docs.pydantic.dev/) v2 (strict validation and schema serialization)
- **Database Driver:** Python Standard Library `sqlite3`

### Database
- **Engine:** SQLite 3
- **File Location:** `backend/data/fireflies.db`

---

## 4. Architecture

### Request Flow

```
[ User Interaction ]
         │
         ▼
[ React Component ]          (src/components/...)
         │
         ▼
[ Custom Hook ]              (src/hooks/...: state, timers, synchronization)
         │
         ▼
[ Frontend Service ]         (src/services/...: domain logic)
         │
         ▼
[ API Client ]               (src/services/apiClient.ts: native fetch, error parsing)
         │  HTTP / JSON
         ▼
[ FastAPI Route ]            (backend/app/api/v1/...: parameters, validation)
         │
         ▼
[ Backend Service ]          (backend/app/services/meeting_service.py)
         │
         ▼
[ Repository Layer ]         (backend/app/repositories/...: DB queries, filters)
         │
         ▼
[ SQLAlchemy ORM ]           (backend/app/models/...: models & relationships)
         │
         ▼
[ SQLite Database ]          (backend/data/fireflies.db)
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Components** (`frontend/src/components/`) | UI presentation, layout structure, accessible event binding, and atomic visual widgets. Divided into `workspace/`, `dashboard/`, `layout/`, and `common/`. |
| **Hooks** (`frontend/src/hooks/`) | Stateful orchestration, server query debouncing, audio playback references, transcript synchronization, and in-transcript search matching. |
| **Frontend Services** (`frontend/src/services/`) | Domain-specific API calls (`meetingService`, `meetingDetailService`, `actionItemService`), isolating components from HTTP networking. |
| **API Client** (`frontend/src/services/apiClient.ts`) | Centralized HTTP wrapper around native `fetch`, managing base URLs, headers, JSON serialization, query parameter encoding, and standardized API error handling. |
| **FastAPI Routes** (`backend/app/api/v1/`) | HTTP entry points defining paths, query parameters, request validation, status codes (`200`, `201`, `204`, `404`, `422`), and DB dependency injection. |
| **Backend Services** (`backend/app/services/`) | Business logic orchestration, mock transcript generation, summary derivation, and relational assembly. |
| **Repositories** (`backend/app/repositories/`) | Data access abstraction for querying SQLite with SQLAlchemy, filtering, sorting, pagination, and scalar subqueries for child entity counts. |
| **Models** (`backend/app/models/`) | Declarative SQLAlchemy ORM entity models specifying table columns, types, primary keys, foreign keys, indexes, and cascading delete relationships. |
| **Schemas** (`backend/app/schemas/`) | Pydantic v2 schemas defining input validation rules, default values, and JSON response serialization contracts. |

---

## 5. Project Structure

```
FireFlies Clone/
├── README.md                           # Project documentation
│
├── backend/                            # Python FastAPI Backend
│   ├── run.sh                          # Startup script for backend with venv & reload
│   ├── requirements.txt                # Python backend dependencies
│   ├── data/
│   │   └── fireflies.db                # SQLite database file
│   ├── app/
│   │   ├── main.py                     # FastAPI application setup, CORS, lifespan, routes
│   │   ├── core/
│   │   │   ├── config.py               # Application settings and CORS configuration
│   │   │   └── database.py             # SQLAlchemy engine, session maker, get_db dependency
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   │   ├── base.py                 # Declarative Base
│   │   │   ├── meeting.py              # Meeting entity with cascade relationships
│   │   │   ├── transcript.py           # Utterance segment entity with timestamps
│   │   │   ├── summary.py              # Executive summary & takeaways entity
│   │   │   ├── action_item.py          # Action item entity
│   │   │   └── topic.py                # Agenda chapter entity
│   │   ├── schemas/                    # Pydantic v2 validation and response schemas
│   │   │   ├── meeting.py              # Meeting schemas & compound query filters
│   │   │   ├── transcript.py           # Transcript schemas
│   │   │   ├── summary.py              # Summary schemas
│   │   │   ├── action_item.py          # Action item schemas
│   │   │   └── topic.py                # Topic schemas
│   │   ├── repositories/               # Database access repositories
│   │   │   ├── meeting_repo.py         # Meeting queries, filtering, sorting, counts
│   │   │   └── action_item_repo.py     # Action item CRUD operations
│   │   ├── services/                   # Application domain services
│   │   │   └── meeting_service.py      # Meeting & intelligence business logic
│   │   ├── api/v1/                     # REST API routers
│   │   │   ├── meetings.py             # Meetings, summary, and topic endpoints
│   │   │   ├── transcripts.py          # Transcript retrieval endpoint
│   │   │   └── action_items.py         # Action items CRUD endpoints
│   │   └── seed/
│   │       └── seed_data.py            # Isolated sample data seed script
│   └── tests/
│       └── test_backend.py             # 17-test end-to-end integration test suite
│
└── frontend/                           # Next.js TypeScript Frontend
    ├── package.json                    # Scripts and dependencies
    ├── next.config.ts                  # Next.js configuration
    ├── tsconfig.json                   # TypeScript configuration
    └── src/
        ├── app/
        │   ├── layout.tsx              # Root HTML shell & top-level layout
        │   ├── page.tsx                # Meetings dashboard view
        │   ├── globals.css             # Theme variables, design tokens, resets
        │   └── meetings/
        │       └── [id]/
        │           └── page.tsx        # Meeting detail workspace route
        ├── components/
        │   ├── common/                 # Reusable atomic UI components
        │   │   ├── Badge.tsx           # Status and platform badges
        │   │   ├── Button.tsx          # Reusable styled buttons
        │   │   ├── ConfirmDeleteModal.tsx # Confirmation modal for meeting deletion
        │   │   ├── EmptyState.tsx      # Fallback empty states
        │   │   ├── Icons.tsx           # Inline SVG icon library
        │   │   ├── Input.tsx           # Styled text inputs
        │   │   ├── Modal.tsx           # Accessible modal container
        │   │   ├── Select.tsx          # Custom styled dropdown
        │   │   └── Toast.tsx           # Notification toast container
        │   ├── layout/                 # Application shell components
        │   │   ├── AppShell.tsx        # Unified layout shell
        │   │   ├── Sidebar.tsx         # Collapsible sidebar with active route state
        │   │   └── TopNav.tsx          # Search bar, notifications, and profile
        │   ├── dashboard/              # Dashboard view components
        │   │   ├── MeetingCard.tsx     # Meeting card with metadata & action icons
        │   │   ├── MeetingFilterBar.tsx# Search, platform, status, and sort controls
        │   │   ├── MeetingListItem.tsx # Alternate list view presentation
        │   │   ├── MeetingStats.tsx    # Summary statistics metric cards
        │   │   └── NewMeetingModal.tsx # Meeting creation modal
        │   └── workspace/              # Meeting detail workspace components
        │       ├── ActionItemRow.tsx   # Inline action item editor & toggle
        │       ├── ActionItemsPanel.tsx# Action items list and creation form
        │       ├── AudioPlayer.tsx     # Scrubbable player with speed & skip controls
        │       ├── EditMeetingModal.tsx# Title & participant editor modal
        │       ├── MeetingHeader.tsx   # Workspace header with actions
        │       ├── MeetingWorkspace.tsx# Three-panel workspace coordinator
        │       ├── SpeakerAvatar.tsx   # Color-coded initials avatar
        │       ├── SummaryPanel.tsx    # Executive summary narrative
        │       ├── Takeaways.tsx       # Key takeaways bulleted list
        │       ├── TopicsPanel.tsx     # Discussion chapters with seek triggers
        │       ├── TranscriptHighlight.tsx # Search term highlighter
        │       ├── TranscriptLine.tsx  # Individual spoken utterance line
        │       ├── TranscriptPanel.tsx # Transcript container with autoscroll
        │       └── TranscriptSearch.tsx# Search input with match navigation
        ├── hooks/                      # Custom React hooks
        │   ├── useAudioPlayer.ts       # HTML5 Audio playback state & controls
        │   ├── useMeetingDetail.ts     # Workspace data fetching & state coordination
        │   ├── useMeetings.ts          # Dashboard meetings fetching & filters
        │   ├── useTranscriptSearch.ts  # In-transcript regex matching & step navigation
        │   └── useTranscriptSync.ts    # Audio time ↔ active transcript segment sync
        ├── services/                   # Client-side API services
        │   ├── apiClient.ts            # Native fetch wrapper with error handling
        │   ├── meetingService.ts       # Dashboard meetings API operations
        │   ├── meetingDetailService.ts # Meeting detail, transcript, topics, summary
        │   └── actionItemService.ts    # Action items CRUD API operations
        ├── lib/                        # Formatting and helper utilities
        │   ├── formatters.ts           # Date, time, and duration formatting
        │   ├── meetingFilters.ts       # Query parameter builders
        │   └── searchUtils.ts          # Transcript highlighting helpers
        └── types/                      # TypeScript domain models
            └── meeting.ts              # Full type definitions for meetings & artifacts
```

---

## 6. Database Schema

The SQLite database (`backend/data/fireflies.db`) implements five relational tables managed via SQLAlchemy ORM.

### 1. `meetings`
Stores primary meeting session records.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY, INDEX | Unique meeting identifier (e.g. `meet-001`) |
| `title` | `VARCHAR(255)` | NOT NULL, INDEX | Meeting title |
| `date` | `DATETIME` | NOT NULL, INDEX | Scheduled / recorded timestamp |
| `duration` | `INTEGER` | NOT NULL, DEFAULT 0 | Duration in seconds |
| `participants` | `TEXT` | NULLABLE | JSON string storing participant array |
| `platform` | `VARCHAR(50)` | NOT NULL, DEFAULT `'google_meet'`, INDEX | Platform (`google_meet`, `zoom`, `teams`) |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'completed'`, INDEX | Status (`completed`, `in_progress`, `scheduled`) |
| `has_transcript`| `BOOLEAN` | NOT NULL, DEFAULT `1` | Indicates whether transcript exists |
| `audio_url` | `VARCHAR(512)` | NULLABLE | Path to audio file or media resource |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT `utcnow` | Record creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL, DEFAULT `utcnow`, onupdate | Record update timestamp |

### 2. `transcripts`
Stores spoken utterance segments with speaker labels and playback timestamps.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY, INDEX | Unique transcript segment identifier |
| `meeting_id` | `VARCHAR(64)` | NOT NULL, FOREIGN KEY (`meetings.id`), INDEX | Parent meeting ID (`ON DELETE CASCADE`) |
| `speaker` | `VARCHAR(100)` | NOT NULL | Name or label of the speaker |
| `start_time` | `FLOAT` | NOT NULL, INDEX | Utterance start time in seconds |
| `end_time` | `FLOAT` | NOT NULL | Utterance end time in seconds |
| `text` | `TEXT` | NOT NULL | Spoken dialogue content |
| `sequence_order`| `INTEGER` | NOT NULL, INDEX | Chronological ordering index (0-based) |

### 3. `summaries`
Stores executive summaries and key takeaways (1:1 relationship with `meetings`).

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY, INDEX | Unique summary identifier |
| `meeting_id` | `VARCHAR(64)` | NOT NULL, UNIQUE, FOREIGN KEY (`meetings.id`), INDEX | Parent meeting ID (`ON DELETE CASCADE`) |
| `overview` | `TEXT` | NOT NULL | Synthesized summary paragraph |
| `key_takeaways`| `TEXT` | NOT NULL | JSON string array of key takeaways |
| `generated_at` | `DATETIME` | NOT NULL, DEFAULT `utcnow` | Summary generation timestamp |

### 4. `action_items`
Stores tasks assigned during meetings.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY, INDEX | Unique action item identifier |
| `meeting_id` | `VARCHAR(64)` | NOT NULL, FOREIGN KEY (`meetings.id`), INDEX | Parent meeting ID (`ON DELETE CASCADE`) |
| `title` | `VARCHAR(255)` | NOT NULL | Task description / title |
| `assignee` | `VARCHAR(100)` | NULLABLE | Person assigned to task |
| `due_date` | `DATETIME` | NULLABLE | Due date timestamp |
| `completed` | `BOOLEAN` | NOT NULL, DEFAULT `0`, INDEX | Completion status flag |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT `utcnow` | Item creation timestamp |

### 5. `topics`
Stores agenda chapters or discussion topics with playback ranges.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY, INDEX | Unique topic chapter identifier |
| `meeting_id` | `VARCHAR(64)` | NOT NULL, FOREIGN KEY (`meetings.id`), INDEX | Parent meeting ID (`ON DELETE CASCADE`) |
| `title` | `VARCHAR(255)` | NOT NULL | Chapter title |
| `description` | `TEXT` | NULLABLE | Summary description of the chapter |
| `start_time` | `FLOAT` | NOT NULL | Chapter start timestamp in seconds |
| `end_time` | `FLOAT` | NOT NULL | Chapter end timestamp in seconds |
| `sequence_order`| `INTEGER` | NOT NULL, INDEX | Chronological ordering index (0-based) |

### Cascading Deletion Behavior
All child tables (`transcripts`, `summaries`, `action_items`, `topics`) define:
- **Foreign Key Constraint:** `FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE`
- **SQLAlchemy ORM Relationship:** `cascade="all, delete-orphan"` on the parent `Meeting` model.
Deleting a meeting cleanly removes all associated transcript segments, summaries, action items, and topic chapters from SQLite.

---

## 7. API Endpoints

The backend exposes a RESTful API under the prefix `/api/v1`.

### Health Check
- `GET /api/v1/health`
  - Returns backend health status, project name, and version.

### Meetings Endpoints
- `GET /api/v1/meetings`
  - Returns paginated meeting summaries (`items`, `total`).
  - Query parameters:
    - `skip` (int, default `0`): Pagination offset.
    - `limit` (int, default `50`): Page size.
    - `search` (str, optional): Search title and participant strings.
    - `participant` (str, optional): Filter by participant name.
    - `date_from` (ISO datetime, optional): Earliest date filter.
    - `date_to` (ISO datetime, optional): Latest date filter.
    - `status` (str, optional): Filter by status (`completed`, `in_progress`, `scheduled`).
    - `platform` (str, optional): Filter by platform (`google_meet`, `zoom`, `teams`).
    - `sort_by` (str, default `'date'`): Sort column (`date`, `title`, `duration`).
    - `sort_order` (str, default `'desc'`): Sort direction (`asc`, `desc`).
- `POST /api/v1/meetings`
  - Creates a new meeting. Status `201 Created`.
  - Body accepts title, date, duration, platform, participants, optional `transcript_text`, and `audio_url`.
  - Automatically derives mock utterances, summary, topics, and initial action items.
- `GET /api/v1/meetings/{meeting_id}`
  - Returns full meeting metadata, participant list, and child entity counts.
- `PATCH /api/v1/meetings/{meeting_id}`
  - Updates meeting fields: `title`, `participants` (array of strings or `{name, email, is_host}` objects), `duration`, `status`, or `platform`.
- `DELETE /api/v1/meetings/{meeting_id}`
  - Deletes the meeting and cascades delete to all child records. Status `204 No Content`.

### Transcripts Endpoint
- `GET /api/v1/meetings/{meeting_id}/transcript`
  - Returns chronological transcript segments with `speaker`, `start_time`, `end_time`, and `text`.

### Summaries & Topics Endpoints
- `GET /api/v1/meetings/{meeting_id}/summary`
  - Returns the executive `overview` paragraph and `key_takeaways` array.
- `GET /api/v1/meetings/{meeting_id}/topics`
  - Returns chronological agenda chapters with `title`, `description`, `start_time`, and `end_time`.

### Action Items Endpoints
- `GET /api/v1/meetings/{meeting_id}/action-items`
  - Returns action items for a meeting along with `total` and `completed_count`.
- `POST /api/v1/meetings/{meeting_id}/action-items`
  - Creates a new action item under a meeting. Status `201 Created`.
  - Body accepts `title`, optional `assignee`, and optional `due_date`.
- `PATCH /api/v1/action-items/{action_item_id}`
  - Updates an action item's `title`, `assignee`, `due_date`, or `completed` status.
- `DELETE /api/v1/action-items/{action_item_id}`
  - Deletes an action item. Status `204 No Content`.

---

## 8. Seed / Mock Data

The application includes sample meetings to support development and testing:

### Seeded Meetings
1. **`meet-001`: Product Strategy & Q4 Roadmap Alignment**
   - Platform: Google Meet (duration: 30m 45s)
   - Participants: Elena Rostova (Host), Marcus Chen, Aaliyah Patel, David Kim
   - Contains 10 diarized transcript utterances, 3 structured discussion chapters, executive overview, 4 key takeaways, and 4 actionable tasks.
2. **`meet-002`: Customer Success Sync - Q3 Retention Review**
   - Platform: Zoom (duration: 45m 10s)
   - Participants: Sarah Jenkins (Host), Michael Chang, Emily Rodriguez
   - Covers enterprise churn analysis, onboarding speed, support tickets, and executive actions.
3. **`meet-003`: Engineering Architecture - Microservices Migration**
   - Platform: Microsoft Teams (duration: 52m 30s)
   - Participants: Alex Rivera (Host), Marcus Chen, Priya Sharma
   - Covers event-driven architecture, gRPC vs REST, database partitioning, and spike tasks.

### Auto-Initialization
When the FastAPI backend starts, its lifespan context verifies whether meetings exist in `backend/data/fireflies.db`. If the database is empty, it automatically triggers `app.seed.seed_data.seed_database()` to populate the default meetings.

### Mock Generation on Creation
When creating new meetings via `POST /api/v1/meetings`:
- If raw transcript text is supplied, the backend parses lines, infers speakers, assigns progressive timestamps, and synthesizes discussion topics, summary, and action items.
- If no transcript text is provided, a realistic multi-turn transcript and intelligence payload are generated automatically.

> **Note:** As permitted by the assignment, real-time speech-to-text audio processing is outside of scope. Transcripts, summaries, topics, and action items are seeded and synthesized deterministically.

---

## 9. Running Locally

### Prerequisites
- **Node.js**: v18.18.0 or newer (Node 20+ recommended)
- **Python**: v3.10, v3.11, or v3.12
- **npm** or **pnpm**

---

### Step 1: Start the FastAPI Backend

Open a terminal window:

```bash
cd backend

# Option A: Using the provided startup script (handles virtualenv & reload)
chmod +x run.sh
./run.sh

# Option B: Manual setup
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export PYTHONPATH="$(pwd):$PYTHONPATH"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server starts at:
- **API Base:** `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/api/v1/docs`
- **Health Check:** `http://127.0.0.1:8000/api/v1/health`

---

### Step 2: Start the Next.js Frontend

In a second terminal window:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

The frontend application starts at:
- **Dashboard:** `http://localhost:3000`
- **Meeting Detail:** `http://localhost:3000/meetings/meet-001`

---

### Step 3: Run Backend Integration Tests

Ensure the backend server is running on `http://127.0.0.1:8000`, then run:

```bash
cd backend
python3 tests/test_backend.py
```

Expected output:
```
============================================================
RUNNING COMPREHENSIVE BACKEND TEST SUITE
============================================================
✓ 1. Health check passed
✓ 2. Base meeting list passed (Total: 3 meetings, transcripts not loaded in payload)
✓ 3. Search text filtering passed (Found 1 matching)
✓ 4. Participant filtering passed (Found 2 meetings with Marcus)
✓ 5. Date range filtering passed (Found 2 meetings in range)
✓ 6. Compound status + platform filtering passed
✓ 7. Sorting passed (Titles sorted ascending correctly)
✓ 8. Pagination (skip/limit) passed
✓ 9. Meeting detail retrieval passed
✓ 10. Transcript retrieval passed (10 utterances)
✓ 11. Topics retrieval passed (3 chapters)
✓ 12. Summary retrieval passed
✓ 13. Action Item CRUD passed (Create, Update, Delete)
✓ 14. Meeting creation with custom transcript_text & string participants passed
✓ 15. 404 error responses verified for all entity paths
✓ 16. 422 validation error handling verified
✓ 17. Meeting participants editing via PATCH verified & persisted successfully
============================================================
ALL 17 BACKEND INTEGRATION TESTS PASSED CLEANLY!
============================================================
```

---

### Step 4: Run Frontend Linting

```bash
cd frontend
npm run lint
```

Exits cleanly with zero lint warnings or errors.

---

### Step 5: Build the Frontend for Production

```bash
cd frontend
npm run build
```

Generates optimized production bundles and prerendered static/hybrid routes.

---

## 10. Assumptions & Out of Scope

In accordance with the assignment specifications, the following capabilities are explicitly **out of scope**:

- **Live Meeting Bot:** No automated bot or headless browser process enters live Zoom, Google Meet, or Microsoft Teams calls.
- **Real Speech-to-Text (STT):** No integration with real-time speech transcription APIs (such as Whisper or Deepgram). Diarized transcripts and timestamps are seeded or synthesized.
- **Third-Party Integrations:** No third-party OAuth integrations (Google Calendar, Outlook, Slack notifications, or Zoom Cloud Recordings).
- **Multi-Tenant Authentication:** Authentication and authorization systems (OAuth2, JWT sessions, multi-user accounts) are out of scope. The application operates as a single-workspace interface.
- **Real-Time Collaboration:** No WebSocket-based collaborative multi-cursor synchronization.

---

## 11. Assignment Notes

- **Mocked / Seeded Intelligence:** The meeting intelligence layer (transcripts, executive summaries, topic chapters, and action items) uses seeded and synthesized data to deliver an authentic Fireflies.ai experience while adhering to assignment boundaries.
- **Decoupled Architecture:** The Next.js frontend interacts exclusively with the backend via HTTP REST endpoints (`http://127.0.0.1:8000/api/v1`). All temporary mock fallbacks have been removed so the backend and SQLite serve as the single source of truth.
- **Pure ORM:** Database interactions strictly utilize SQLAlchemy ORM with SQLite.
- **Native Browser Fetch:** Network communication on the frontend relies on the standard `fetch` API without third-party HTTP wrappers.
