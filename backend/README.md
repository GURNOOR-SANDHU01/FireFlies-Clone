# Fireflies Clone - Backend API Service

FastAPI + SQLAlchemy + SQLite backend service for the Fireflies meeting intelligence workspace.

---

## Architecture Overview

```
backend/
├── app/
│   ├── api/v1/                  # FastAPI routers (HTTP request/response handling)
│   │   ├── meetings.py          # /api/v1/meetings (CRUD, topics, summary, filters)
│   │   ├── transcripts.py       # /api/v1/meetings/{id}/transcript
│   │   └── action_items.py      # /api/v1/action-items & meeting action items
│   ├── core/                    # App configuration & SQLite engine sessionmaker
│   │   ├── config.py            # Strongly typed settings & CORS
│   │   └── database.py          # SQLite engine with PRAGMA foreign_keys=ON
│   ├── models/                  # SQLAlchemy ORM declarative models
│   │   ├── meeting.py           # Meeting entity with cascading relationships
│   │   ├── transcript.py        # Transcript segments with sequence ordering
│   │   ├── action_item.py       # ActionItem task entity
│   │   ├── topic.py             # Agenda topics & chapter timecodes
│   │   └── summary.py           # Executive AI summary and key takeaways
│   ├── schemas/                 # Pydantic validation & response schemas
│   │   ├── meeting.py
│   │   ├── transcript.py
│   │   ├── action_item.py
│   │   ├── topic.py
│   │   └── summary.py
│   ├── repositories/            # Data access layer (raw SQLAlchemy queries)
│   │   ├── meeting_repo.py
│   │   └── action_item_repo.py
│   ├── services/                # Business logic & mock artifact generation
│   │   └── meeting_service.py
│   ├── seed/                    # Standalone development sample data initialization
│   │   └── seed_data.py
│   └── main.py                  # FastAPI application entry point
├── tests/
│   └── test_backend.py          # Comprehensive test suite covering all requirements
├── data/
│   └── fireflies.db             # Persistent SQLite database file
├── requirements.txt
└── run.sh
```

---

## Query & Performance Strategy (Dashboard vs Detail)

A critical architectural distinction is maintained between the dashboard view and the meeting detail workspace:

### 1. Dashboard (`GET /api/v1/meetings`)
* **Lightweight Metadata & Aggregate Subqueries**: Returns only high-level meeting metadata, summary preview snippet, and participant rosters.
* **No Transcripts Loaded**: Transcripts are **never loaded** during meeting library listing. In production workspaces, meetings contain thousands of utterances; loading them on the dashboard creates massive memory footprints and slow response times.
* **No Cartesian Product Joins**: Action item counts and transcript segment counts are computed using atomic SQL scalar subqueries (`SELECT count(...) FROM action_items WHERE meeting_id = meetings.id`). This prevents multi-collection Cartesian products and keeps the result set to exactly 1 database row per meeting.

### 2. Meeting Workspace Detail (`/api/v1/meetings/{id}/*`)
* **Separation of Concerns**: Transcript segments, chapters/topics, executive summaries, and action items are loaded through dedicated, cache-friendly endpoints:
  - Transcript: `GET /api/v1/meetings/{id}/transcript`
  - Topics: `GET /api/v1/meetings/{id}/topics`
  - Summary: `GET /api/v1/meetings/{id}/summary`
  - Action Items: `GET /api/v1/meetings/{id}/action-items`

---

## Setup & Running the Server

### 1. Prerequisites
* Python 3.10+ (tested with Python 3.14)

### 2. Environment Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Seed Database
To populate the SQLite database (`backend/data/fireflies.db`) with comprehensive meeting sessions (diarized transcripts, topics, summaries, and action items):
```bash
python -m app.seed.seed_data
```

### 4. Start Development Server
```bash
# Using the convenience runner:
./run.sh

# Or directly using uvicorn:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive OpenAPI Documentation will be available at:
* Swagger UI: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
* ReDoc: [http://127.0.0.1:8000/api/v1/redoc](http://127.0.0.1:8000/api/v1/redoc)

### 5. Running the Automated Test Suite
```bash
python tests/test_backend.py
```

---

## Meeting List Query Parameters (`GET /api/v1/meetings`)

| Parameter | Type | Validation / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | `max_length=100` | Case-insensitive search matching meeting title or participant names |
| `participant` | `string` | `max_length=100` | Case-insensitive filter matching specific participant names |
| `date_from` | `datetime / date` | ISO 8601 or `YYYY-MM-DD` | Start date filter (inclusive) |
| `date_to` | `datetime / date` | ISO 8601 or `YYYY-MM-DD` | End date filter (inclusive) |
| `status` | `string` | `max_length=50` | Meeting status (`completed`, `processing`, `scheduled`, or `all`) |
| `platform` | `string` | `max_length=50` | Meeting platform (`google_meet`, `zoom`, `teams`, `in_person`, `audio_upload`, or `all`) |
| `sort_by` | `string` | Regex: `^(date\|title\|duration)$` | Field to sort by (defaults to `date`) |
| `sort_order` | `string` | Regex: `^(asc\|desc)$` | Sort direction (defaults to `desc`) |
| `skip` | `integer` | `ge=0` | Pagination offset (defaults to `0`) |
| `limit` | `integer` | `ge=1, le=100` | Max items returned per page (defaults to `50`) |

### Example Filter Requests

```bash
# 1. Search by keyword
curl -s "http://127.0.0.1:8000/api/v1/meetings?search=Roadmap"

# 2. Filter by participant name
curl -s "http://127.0.0.1:8000/api/v1/meetings?participant=Marcus"

# 3. Filter by date range
curl -s "http://127.0.0.1:8000/api/v1/meetings?date_from=2026-10-01&date_to=2026-10-08"

# 4. Filter by status and platform
curl -s "http://127.0.0.1:8000/api/v1/meetings?status=completed&platform=google_meet"

# 5. Sort by title ascending with pagination
curl -s "http://127.0.0.1:8000/api/v1/meetings?sort_by=title&sort_order=asc&skip=0&limit=10"
```

---

## Meeting Creation with Optional `transcript_text` (`POST /api/v1/meetings`)

Meeting creation supports both default simulated artifacts and user-supplied `transcript_text`.

### Example 1: Creating with Custom `transcript_text` & String Participants
```bash
curl -X POST http://127.0.0.1:8000/api/v1/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile Audio Offline Sync",
    "date": "2026-10-08T14:00:00Z",
    "duration": 1800,
    "platform": "google_meet",
    "status": "completed",
    "participants": ["Aman", "Rahul"],
    "transcript_text": "Aman: Welcome Rahul. Let us review the offline sync algorithm.\nRahul: The local SQLite database caches playback segments seamlessly.\nAman: Agreed. Let us schedule a follow-up test with the QA team."
  }'
```
* **Result**:
  - Automatically parses the lines into sequential `Transcript` records with calculated `start_time` and `end_time`.
  - Automatically synthesizes a `Summary` with key takeaways.
  - Generates discussion `Topic` chapters.
  - Automatically extracts candidate `ActionItem` tasks assigned to participants.

### Example 2: Creating without `transcript_text`
```bash
curl -X POST http://127.0.0.1:8000/api/v1/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly Team Check-in",
    "date": "2026-10-08T15:00:00Z",
    "duration": 900,
    "platform": "zoom",
    "status": "completed"
  }'
```
* **Result**: Retains default realistic mock artifact generation.

---

## Complete API Endpoints List

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status check |
| `GET` | `/api/v1/meetings` | List meetings with compound filters (`search`, `participant`, `date_from`, `date_to`, `status`, `platform`, `sort_by`, `sort_order`, `skip`, `limit`) |
| `POST` | `/api/v1/meetings` | Create meeting (supports optional `transcript_text` and flexible participant formats) |
| `GET` | `/api/v1/meetings/{id}` | Get meeting details by ID |
| `PATCH` | `/api/v1/meetings/{id}` | Update meeting attributes |
| `DELETE` | `/api/v1/meetings/{id}` | Delete meeting and cascade all child records |
| `GET` | `/api/v1/meetings/{id}/transcript` | Get all ordered transcript utterances |
| `GET` | `/api/v1/meetings/{id}/topics` | Get discussion chapters / topics |
| `GET` | `/api/v1/meetings/{id}/summary` | Get executive summary & takeaways |
| `GET` | `/api/v1/meetings/{id}/action-items` | Get action items for a meeting |
| `POST` | `/api/v1/meetings/{id}/action-items` | Add a new action item to a meeting |
| `PATCH` | `/api/v1/action-items/{id}` | Update action item (title, assignee, completed status) |
| `DELETE` | `/api/v1/action-items/{id}` | Delete action item |
