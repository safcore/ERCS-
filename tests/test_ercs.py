"""
ERCS Automated Test Suite
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031

Tests all 12 core requirements + state model constraints:
1. Create incident
2. Required-field validation
3. Correct initial state (REPORTED)
4. REPORTED -> VERIFIED
5. VERIFIED -> DISPATCHED
6. DISPATCHED -> RESPONDING
7. RESPONDING -> RESOLVED
8. Invalid REPORTED -> RESOLVED (rejected)
9. Invalid REPORTED -> RESPONDING (rejected)
10. Invalid incident ID (404)
11. Assign available response unit
12. Reject unavailable response unit
"""

import os
import sys
import tempfile
import pytest

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, backend_dir)

from app import create_app
from database import init_db


@pytest.fixture
def client():
    """Configures test client with an isolated temporary SQLite database."""
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    app = create_app(db_path=db_path)
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client

    os.close(db_fd)
    if os.path.exists(db_path):
        os.remove(db_path)


def test_01_create_incident(client):
    """Test 1: Create a new incident successfully."""
    payload = {
        "emergency_type": "Fire",
        "location": "Chembur East, Station Road",
        "description": "Short circuit in retail electrical meter board.",
        "priority": "HIGH",
        "reported_by": "Vikram Singh",
        "contact_number": "+91 99887 66554",
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True
    assert "incident" in data
    assert data["incident"]["location"] == payload["location"]
    assert data["incident"]["id"].startswith("ER-")


def test_02_required_field_validation(client):
    """Test 2: Validation of required fields and invalid enum values."""
    # Missing location and priority
    payload = {
        "emergency_type": "Fire",
        "description": "Missing fields test",
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "Validation failed" in data["error"]

    # Invalid emergency type
    invalid_type_payload = {
        "emergency_type": "Alien Invasion",
        "location": "Marine Drive",
        "description": "N/A",
        "priority": "HIGH",
    }
    response = client.post("/api/incidents", json=invalid_type_payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "Invalid emergency type" in str(data["details"])


def test_03_correct_initial_state(client):
    """Test 3: New incident MUST always begin strictly in state REPORTED."""
    payload = {
        "emergency_type": "Medical",
        "location": "Dadar Flower Market",
        "description": "Pedestrian collapsed due to heat exhaustion.",
        "priority": "MEDIUM",
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 201
    incident_id = response.get_json()["incident"]["id"]

    get_resp = client.get(f"/api/incidents/{incident_id}")
    assert get_resp.status_code == 200
    inc_data = get_resp.get_json()
    assert inc_data["incident"]["status"] == "REPORTED"
    assert "VERIFIED" in inc_data["allowed_next_states"]


def test_04_transition_reported_to_verified(client):
    """Test 4: State transition REPORTED -> VERIFIED succeeds."""
    # Seed ER-001 is in REPORTED state
    response = client.post("/api/incidents/ER-001/verify", json={"verification_notes": "Officer verified via radio."})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["previous_state"] == "REPORTED"
    assert data["current_state"] == "VERIFIED"

    # Verify updated record
    fetch = client.get("/api/incidents/ER-001")
    assert fetch.get_json()["incident"]["status"] == "VERIFIED"


def test_05_transition_verified_to_dispatched(client):
    """Test 5: State transition VERIFIED -> DISPATCHED with available unit."""
    # Seed ER-002 is in VERIFIED state
    payload = {"unit_id": "RU-FIRE-01", "notes": "Fire Unit 01 assigned to collision site."}
    response = client.post("/api/incidents/ER-002/dispatch", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["previous_state"] == "VERIFIED"
    assert data["current_state"] == "DISPATCHED"

    # Verify unit is now ASSIGNED
    unit_resp = client.get("/api/response-units/RU-FIRE-01")
    assert unit_resp.get_json()["unit"]["status"] == "ASSIGNED"


def test_06_transition_dispatched_to_responding(client):
    """Test 6: State transition DISPATCHED -> RESPONDING."""
    # Seed ER-003 is in DISPATCHED state (assigned to RU-POL-01)
    response = client.post("/api/incidents/ER-003/respond", json={"notes": "Police unit arrived on site."})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["previous_state"] == "DISPATCHED"
    assert data["current_state"] == "RESPONDING"

    # Verify unit is now BUSY
    unit_resp = client.get("/api/response-units/RU-POL-01")
    assert unit_resp.get_json()["unit"]["status"] == "BUSY"


def test_07_transition_responding_to_resolved(client):
    """Test 7: State transition RESPONDING -> RESOLVED and unit release."""
    # Seed ER-004 is in RESPONDING state (assigned to RU-RESCUE-01)
    response = client.post("/api/incidents/ER-004/resolve", json={"resolution_notes": "Billboard cleared safely."})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["previous_state"] == "RESPONDING"
    assert data["current_state"] == "RESOLVED"

    # Verify unit is released back to AVAILABLE
    unit_resp = client.get("/api/response-units/RU-RESCUE-01")
    assert unit_resp.get_json()["unit"]["status"] == "AVAILABLE"
    assert unit_resp.get_json()["unit"]["current_incident_id"] is None


def test_08_invalid_transition_reported_to_resolved(client):
    """Test 8: Reject invalid transition REPORTED -> RESOLVED."""
    # Seed ER-001 is in REPORTED state
    response = client.post("/api/incidents/ER-001/resolve", json={"resolution_notes": "Attempt illegal skip"})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "Invalid state transition" in data["error"]


def test_09_invalid_transition_reported_to_responding(client):
    """Test 9: Reject invalid transition REPORTED -> RESPONDING."""
    # Seed ER-001 is in REPORTED state
    response = client.post("/api/incidents/ER-001/respond", json={"notes": "Attempt illegal skip to responding"})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "Invalid state transition" in data["error"]


def test_10_invalid_incident_id(client):
    """Test 10: Non-existent incident ID returns 404."""
    response = client.get("/api/incidents/ER-99999")
    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert "not found" in data["error"].lower()


def test_11_assign_available_unit(client):
    """Test 11: Coordinator successfully assigns an AVAILABLE response unit."""
    # Seed ER-002 is VERIFIED. RU-AMB-01 is AVAILABLE.
    response = client.post("/api/incidents/ER-002/dispatch", json={"unit_id": "RU-AMB-01"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["assigned_unit"]["id"] == "RU-AMB-01"


def test_12_reject_unavailable_unit(client):
    """Test 12: Coordinator cannot assign an already ASSIGNED or BUSY unit."""
    # In seed data, RU-POL-01 is already ASSIGNED to ER-003.
    # Attempting to assign RU-POL-01 to ER-002 must be rejected.
    response = client.post("/api/incidents/ER-002/dispatch", json={"unit_id": "RU-POL-01"})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "not AVAILABLE" in data["error"]


def test_13_terminal_resolved_state_immutable(client):
    """Test 13: RESOLVED is terminal and cannot transition to anything."""
    # ER-005 is already RESOLVED in seed data
    response = client.post("/api/incidents/ER-005/verify")
    assert response.status_code == 400
    data = response.get_json()
    assert "terminal state" in data["error"].lower()


def test_14_incident_events_audit_log(client):
    """Test 14: Events timeline is appended accurately across transitions."""
    # Check events for ER-003
    response = client.get("/api/incidents/ER-003/events")
    assert response.status_code == 200
    events = response.get_json()["events"]
    assert len(events) >= 3
    # Check chronological ordering
    states = [e["to_state"] for e in events]
    assert states[0] == "REPORTED"
    assert states[1] == "VERIFIED"
    assert states[2] == "DISPATCHED"
