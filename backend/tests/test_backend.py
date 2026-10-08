"""
File: backend/tests/test_backend.py

Purpose:
Comprehensive integration test suite covering all backend assignment requirements.

Responsibilities:
- Validate filtering (search, participant, date ranges, status, platform).
- Validate sorting and pagination.
- Validate meeting, transcript, topics, summary, and action-item endpoints.
- Validate custom transcript_text ingestion and mock artifact generation.
- Validate 404 and 422 error boundaries.
- Verify lightweight dashboard payload performance.

This module does NOT:
- Mock database connections; runs against live SQLite server.
"""

import sys
from datetime import datetime, timezone
import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"


def api_request(method: str, path: str, payload: dict = None, expected_status: int = 200) -> dict:
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload).encode("utf-8") if payload else None

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            assert status == expected_status, f"Expected {expected_status}, got {status} for {method} {url}"
            if status == 204:
                return {}
            body = response.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        assert e.code == expected_status, f"Expected {expected_status}, got {e.code} for {method} {url}. Response: {e.read().decode()}"
        body = e.read().decode("utf-8")
        return json.loads(body) if body else {}


def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE BACKEND TEST SUITE")
    print("=" * 60)

    # 1. Health check
    res = api_request("GET", "/health", expected_status=200)
    assert res["status"] == "healthy"
    print("✓ 1. Health check passed")

    # 2. Base Meeting list
    res = api_request("GET", "/meetings", expected_status=200)
    assert "items" in res and "total" in res
    assert res["total"] >= 3
    # Check that transcript segments collection is NOT present in meeting objects
    first = res["items"][0]
    assert "transcripts" not in first, "Transcripts collection should NOT be in dashboard item!"
    assert "transcript_segments_count" in first
    assert "action_items_count" in first
    assert "completed_action_items_count" in first
    print(f"✓ 2. Base meeting list passed (Total: {res['total']} meetings, transcripts not loaded in payload)")

    # 3. Search filtering
    res = api_request("GET", "/meetings?search=Roadmap", expected_status=200)
    assert res["total"] >= 1
    assert any("Roadmap" in m["title"] for m in res["items"])
    print(f"✓ 3. Search text filtering passed (Found {res['total']} matching)")

    # 4. Participant filtering
    res = api_request("GET", "/meetings?participant=Marcus", expected_status=200)
    assert res["total"] >= 1
    for m in res["items"]:
        names = [p["name"] for p in m["participants"]]
        assert any("Marcus" in name for name in names), f"Marcus not found in {names}"
    print(f"✓ 4. Participant filtering passed (Found {res['total']} meetings with Marcus)")

    # 5. Date range filtering (date_from and date_to)
    res = api_request("GET", "/meetings?date_from=2026-10-06T00:00:00&date_to=2026-10-08T23:59:59", expected_status=200)
    assert res["total"] >= 2
    for m in res["items"]:
        m_date = datetime.fromisoformat(m["date"].replace("Z", "+00:00"))
        assert m_date.day in [6, 7], f"Unexpected date: {m_date}"
    print(f"✓ 5. Date range filtering passed (Found {res['total']} meetings in range)")

    # 6. Status and platform filtering
    res = api_request("GET", "/meetings?status=completed&platform=google_meet", expected_status=200)
    assert res["total"] >= 1
    for m in res["items"]:
        assert m["status"] == "completed"
        assert m["platform"] == "google_meet"
    print(f"✓ 6. Compound status + platform filtering passed")

    # 7. Sorting: title ascending vs date descending
    res_title = api_request("GET", "/meetings?sort_by=title&sort_order=asc", expected_status=200)
    titles = [m["title"] for m in res_title["items"]]
    assert titles == sorted(titles), "Titles not sorted ascending"
    print(f"✓ 7. Sorting passed (Titles sorted ascending correctly)")

    # 8. Pagination (skip & limit)
    res_page1 = api_request("GET", "/meetings?skip=0&limit=1", expected_status=200)
    assert len(res_page1["items"]) == 1
    res_page2 = api_request("GET", "/meetings?skip=1&limit=1", expected_status=200)
    assert len(res_page2["items"]) == 1
    assert res_page1["items"][0]["id"] != res_page2["items"][0]["id"]
    print("✓ 8. Pagination (skip/limit) passed")

    # 9. Meeting Detail
    m_id = "meet-001"
    detail = api_request("GET", f"/meetings/{m_id}", expected_status=200)
    assert detail["id"] == m_id
    assert detail["title"] == "Product Strategy & Q4 Roadmap Alignment"
    print("✓ 9. Meeting detail retrieval passed")

    # 10. Meeting Transcripts
    trans = api_request("GET", f"/meetings/{m_id}/transcript", expected_status=200)
    assert trans["meeting_id"] == m_id
    assert len(trans["segments"]) >= 10
    assert trans["segments"][0]["sequence_order"] == 1
    assert "start_time" in trans["segments"][0]
    print(f"✓ 10. Transcript retrieval passed ({len(trans['segments'])} utterances)")

    # 11. Meeting Topics
    topics = api_request("GET", f"/meetings/{m_id}/topics", expected_status=200)
    assert topics["meeting_id"] == m_id
    assert len(topics["topics"]) >= 2
    print(f"✓ 11. Topics retrieval passed ({len(topics['topics'])} chapters)")

    # 12. Meeting Summary
    summary = api_request("GET", f"/meetings/{m_id}/summary", expected_status=200)
    assert summary["meeting_id"] == m_id
    assert len(summary["overview"]) > 20
    assert isinstance(summary["key_takeaways"], list)
    assert len(summary["key_takeaways"]) >= 3
    print("✓ 12. Summary retrieval passed")

    # 13. Action Items CRUD
    action_items = api_request("GET", f"/meetings/{m_id}/action-items", expected_status=200)
    initial_count = len(action_items["items"])
    assert initial_count >= 2

    # Create action item
    new_act = api_request("POST", f"/meetings/{m_id}/action-items", payload={
        "title": "Automated Test Action Item",
        "assignee": "Aaliyah Patel"
    }, expected_status=201)
    act_id = new_act["id"]
    assert new_act["completed"] is False

    # Update action item
    upd_act = api_request("PATCH", f"/action-items/{act_id}", payload={"completed": True}, expected_status=200)
    assert upd_act["completed"] is True

    # Delete action item
    api_request("DELETE", f"/action-items/{act_id}", expected_status=204)
    print("✓ 13. Action Item CRUD passed (Create, Update, Delete)")

    # 14. Meeting Creation with Custom transcript_text and string participants
    custom_meeting_payload = {
        "title": "AI Audio Model Evaluation Sync",
        "date": "2026-10-08T16:00:00Z",
        "duration": 1200,
        "platform": "zoom",
        "status": "completed",
        "participants": ["Aman", "Rahul"],
        "transcript_text": (
            "Aman: Welcome Rahul, let's evaluate our transcription accuracy benchmarks.\n"
            "Rahul: Hi Aman. I reviewed the test runs and the latency is down to 400ms.\n"
            "Aman: Excellent. We will schedule a team demo for next Monday.\n"
            "Rahul: I will prepare the benchmark charts before then."
        )
    }
    created_custom = api_request("POST", "/meetings", payload=custom_meeting_payload, expected_status=201)
    c_id = created_custom["id"]
    assert created_custom["title"] == "AI Audio Model Evaluation Sync"
    # Check participants normalized
    assert len(created_custom["participants"]) == 2
    assert created_custom["participants"][0]["name"] == "Aman"
    assert created_custom["transcript_segments_count"] == 4
    assert created_custom["action_items_count"] >= 1

    # Verify transcripts created
    c_trans = api_request("GET", f"/meetings/{c_id}/transcript", expected_status=200)
    assert len(c_trans["segments"]) == 4
    assert c_trans["segments"][0]["speaker"] == "Aman"
    assert c_trans["segments"][1]["speaker"] == "Rahul"

    # Verify summary generated
    c_sum = api_request("GET", f"/meetings/{c_id}/summary", expected_status=200)
    assert "AI Audio Model Evaluation Sync" in c_sum["overview"]

    # Delete custom meeting
    api_request("DELETE", f"/meetings/{c_id}", expected_status=204)
    print("✓ 14. Meeting creation with custom transcript_text & string participants passed")

    # 15. 404 Error handling
    api_request("GET", "/meetings/non-existent-xyz", expected_status=404)
    api_request("GET", "/meetings/non-existent-xyz/transcript", expected_status=404)
    api_request("PATCH", "/action-items/non-existent-act", payload={"completed": True}, expected_status=404)
    print("✓ 15. 404 error responses verified for all entity paths")

    api_request("POST", "/meetings", payload={"duration": -100}, expected_status=422)
    api_request("GET", "/meetings?sort_by=illegal_column", expected_status=422)
    print("✓ 16. 422 validation error handling verified")

    # 17. Meeting Participant Update via PATCH
    # Create test meeting with initial participants
    patch_test_meeting = api_request("POST", "/meetings", payload={
        "title": "Participant Metadata Update Test",
        "date": "2026-10-08T17:00:00Z",
        "duration": 600,
        "platform": "google_meet",
        "status": "completed",
        "participants": ["Initial Participant A", "Initial Participant B"]
    }, expected_status=201)
    p_meet_id = patch_test_meeting["id"]
    assert len(patch_test_meeting["participants"]) == 2
    assert patch_test_meeting["participants"][0]["name"] == "Initial Participant A"

    # Update participants via PATCH with both object format and string format
    updated_participants_payload = [
        {"name": "Priya Sharma", "email": "priya@fireflies.ai", "is_host": True},
        "Vikram Malhotra"
    ]
    patched_meeting = api_request(
        "PATCH",
        f"/meetings/{p_meet_id}",
        payload={"participants": updated_participants_payload},
        expected_status=200
    )
    assert len(patched_meeting["participants"]) == 2
    assert patched_meeting["participants"][0]["name"] == "Priya Sharma"
    assert patched_meeting["participants"][0]["email"] == "priya@fireflies.ai"
    assert patched_meeting["participants"][1]["name"] == "Vikram Malhotra"

    # Re-fetch independently to guarantee persistence in SQLite
    persisted_fetch = api_request("GET", f"/meetings/{p_meet_id}", expected_status=200)
    p_names = [p["name"] for p in persisted_fetch["participants"]]
    assert "Priya Sharma" in p_names
    assert "Vikram Malhotra" in p_names
    assert "Initial Participant A" not in p_names

    # Verify participant filter finds the newly patched meeting
    filtered_by_new_participant = api_request("GET", f"/meetings?participant=Priya", expected_status=200)
    assert any(m["id"] == p_meet_id for m in filtered_by_new_participant["items"])

    # Clean up test meeting
    api_request("DELETE", f"/meetings/{p_meet_id}", expected_status=204)
    print("✓ 17. Meeting participants editing via PATCH verified & persisted successfully")

    print("=" * 60)
    print("ALL 17 BACKEND INTEGRATION TESTS PASSED CLEANLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
