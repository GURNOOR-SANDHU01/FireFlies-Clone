#!/usr/bin/env bash
# Script: backend/run.sh
# Purpose: Start the FastAPI backend with SQLite persistence and development reload.

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Activate virtual environment if present
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Ensure PYTHONPATH includes backend directory
export PYTHONPATH="$DIR:$PYTHONPATH"

# Ensure data directory exists
mkdir -p data

echo "Starting FastAPI server on http://127.0.0.1:8000..."
exec uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
