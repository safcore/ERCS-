"""
ERCS Incidents Blueprint
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031
Enforces strict State Machine lifecycle and audit trail.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import re

from models import (
    STATUS_REPORTED,
    STATUS_VERIFIED,
    STATUS_DISPATCHED,
    STATUS_RESPONDING,
    STATUS_RESOLVED,
    VALID_TRANSITIONS,
    VALID_EMERGENCY_TYPES,
    VALID_PRIORITIES,
    UNIT_STATUS_AVAILABLE,
    UNIT_STATUS_ASSIGNED,
    UNIT_STATUS_BUSY,
    ACTOR_REPORTER,
    ACTOR_COORDINATOR,
    ACTOR_UNIT,
    validate_transition,
    get_utc_iso_timestamp,
)
from database import get_db_connection

incidents_bp = Blueprint("incidents", __name__)


def generate_next_incident_id(conn) -> str:
    """Generates next human-readable ID, e.g. ER-006, ER-007, etc."""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM incidents;")
    rows = cursor.fetchall()
    max_num = 0
    for row in rows:
        match = re.search(r"ER-(\d+)", row["id"])
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num
    return f"ER-{max_num + 1:03d}"


@incidents_bp.route("/incidents", methods=["GET"])
def get_incidents():
    """List incidents with optional filters for status, priority, type, and search term."""
    conn = get_db_connection()
    cursor = conn.cursor()

    status_filter = request.args.get("status")
    priority_filter = request.args.get("priority")
    type_filter = request.args.get("type")
    search = request.args.get("search")

    query = """
        SELECT i.*, u.name as unit_name, u.type as unit_type, u.status as unit_status
        FROM incidents i
        LEFT JOIN response_units u ON i.assigned_unit_id = u.id
        WHERE 1=1
    """
    params = []

    if status_filter:
        query += " AND i.status = ?"
        params.append(status_filter)
    if priority_filter:
        query += " AND i.priority = ?"
        params.append(priority_filter)
    if type_filter:
        query += " AND i.emergency_type = ?"
        params.append(type_filter)
    if search:
        search_pattern = f"%{search.strip()}%"
        query += " AND (i.id LIKE ? OR i.location LIKE ? OR i.description LIKE ? OR i.reported_by LIKE ?)"
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

    query += " ORDER BY i.reported_at DESC;"

    cursor.execute(query, params)
    incidents = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({"success": True, "count": len(incidents), "incidents": incidents}), 200


@incidents_bp.route("/incidents", methods=["POST"])
def create_incident():
    """Creates a new incident in REPORTED state."""
    data = request.get_json(silent=True) or {}

    emergency_type = data.get("emergency_type", "").strip()
    location = data.get("location", "").strip()
    description = data.get("description", "").strip()
    priority = data.get("priority", "").strip()
    reported_by = data.get("reported_by", "").strip() or "Citizen / Anonymous"
    contact_number = data.get("contact_number", "").strip() or None

    # Required field validation
    errors = []
    if not emergency_type:
        errors.append("Emergency type is required.")
    elif emergency_type not in VALID_EMERGENCY_TYPES:
        errors.append(f"Invalid emergency type. Must be one of: {', '.join(VALID_EMERGENCY_TYPES)}.")

    if not location:
        errors.append("Incident location is required.")

    if not description:
        errors.append("Incident description is required.")

    if not priority:
        errors.append("Priority level is required.")
    elif priority not in VALID_PRIORITIES:
        errors.append(f"Invalid priority level. Must be one of: {', '.join(VALID_PRIORITIES)}.")

    if errors:
        return jsonify({"success": False, "error": "Validation failed", "details": errors}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    incident_id = generate_next_incident_id(conn)
    timestamp = get_utc_iso_timestamp()

    # Initial state is strictly REPORTED
    initial_status = STATUS_REPORTED

    cursor.execute(
        """
        INSERT INTO incidents (
            id, emergency_type, location, description, priority,
            status, reported_by, contact_number, reported_at,
            last_updated_at, assigned_unit_id, verification_notes, resolution_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL);
        """,
        (
            incident_id,
            emergency_type,
            location,
            description,
            priority,
            initial_status,
            reported_by,
            contact_number,
            timestamp,
            timestamp,
        ),
    )

    # Append initial event in the audit trail
    cursor.execute(
        """
        INSERT INTO incident_events (
            incident_id, timestamp, from_state, to_state, actor, action, notes
        ) VALUES (?, ?, NULL, ?, ?, ?, ?);
        """,
        (
            incident_id,
            timestamp,
            initial_status,
            ACTOR_REPORTER,
            "Report Emergency",
            f"Emergency reported by {reported_by}. Type: {emergency_type}, Priority: {priority}.",
        ),
    )

    conn.commit()

    cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,))
    created_incident = dict(cursor.fetchone())
    conn.close()

    return (
        jsonify({
            "success": True,
            "message": f"Incident {incident_id} successfully created and registered in state '{initial_status}'.",
            "incident": created_incident,
        }),
        201,
    )


@incidents_bp.route("/incidents/<incident_id>", methods=["GET"])
def get_incident(incident_id: str):
    """Retrieves full incident details, assigned unit, and valid next actions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT i.*, u.name as unit_name, u.type as unit_type, u.status as unit_status, u.station_location
        FROM incidents i
        LEFT JOIN response_units u ON i.assigned_unit_id = u.id
        WHERE i.id = ?;
        """,
        (incident_id,),
    )
    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    incident = dict(row)

    # Fetch events timeline
    cursor.execute(
        """
        SELECT * FROM incident_events
        WHERE incident_id = ?
        ORDER BY id ASC;
        """,
        (incident_id,),
    )
    events = [dict(ev) for ev in cursor.fetchall()]
    conn.close()

    current_status = incident["status"]
    allowed_transitions = VALID_TRANSITIONS.get(current_status, [])

    return (
        jsonify({
            "success": True,
            "incident": incident,
            "allowed_next_states": allowed_transitions,
            "events": events,
        }),
        200,
    )


@incidents_bp.route("/incidents/<incident_id>/verify", methods=["POST"])
def verify_incident(incident_id: str):
    """Transitions an incident from REPORTED to VERIFIED."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    current_status = row["status"]
    target_status = STATUS_VERIFIED

    is_valid, reason = validate_transition(current_status, target_status)
    if not is_valid:
        conn.close()
        return jsonify({"success": False, "error": reason, "current_state": current_status, "target_state": target_status}), 400

    data = request.get_json(silent=True) or {}
    notes = data.get("verification_notes", "").strip() or "Incident authenticity verified by Emergency Coordinator."
    actor = data.get("actor", "").strip() or ACTOR_COORDINATOR
    timestamp = get_utc_iso_timestamp()

    cursor.execute(
        """
        UPDATE incidents
        SET status = ?, verification_notes = ?, last_updated_at = ?
        WHERE id = ?;
        """,
        (target_status, notes, timestamp, incident_id),
    )

    cursor.execute(
        """
        INSERT INTO incident_events (
            incident_id, timestamp, from_state, to_state, actor, action, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (incident_id, timestamp, current_status, target_status, actor, "Verify Incident", notes),
    )

    conn.commit()
    conn.close()

    return (
        jsonify({
            "success": True,
            "message": f"Incident {incident_id} successfully verified. State transitioned to '{target_status}'.",
            "previous_state": current_status,
            "current_state": target_status,
        }),
        200,
    )


@incidents_bp.route("/incidents/<incident_id>/dispatch", methods=["POST"])
def dispatch_incident(incident_id: str):
    """
    Transitions an incident from VERIFIED to DISPATCHED.
    Requires a valid, AVAILABLE response unit ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    current_status = row["status"]
    target_status = STATUS_DISPATCHED

    is_valid, reason = validate_transition(current_status, target_status)
    if not is_valid:
        conn.close()
        return jsonify({"success": False, "error": reason, "current_state": current_status, "target_state": target_status}), 400

    data = request.get_json(silent=True) or {}
    unit_id = data.get("unit_id", "").strip()
    notes = data.get("notes", "").strip()
    actor = data.get("actor", "").strip() or ACTOR_COORDINATOR

    if not unit_id:
        conn.close()
        return jsonify({"success": False, "error": "unit_id is required to dispatch a response unit."}), 400

    # Validate Response Unit existence and availability
    cursor.execute("SELECT * FROM response_units WHERE id = ?;", (unit_id,))
    unit = cursor.fetchone()
    if not unit:
        conn.close()
        return jsonify({"success": False, "error": f"Response unit '{unit_id}' does not exist."}), 404

    if unit["status"] != UNIT_STATUS_AVAILABLE:
        conn.close()
        return (
            jsonify({
                "success": False,
                "error": f"Cannot dispatch: Response unit '{unit['name']}' ({unit['id']}) is currently '{unit['status']}' and not AVAILABLE.",
                "unit_id": unit_id,
                "unit_status": unit["status"],
            }),
            400,
        )

    timestamp = get_utc_iso_timestamp()
    dispatch_notes = notes or f"Dispatched {unit['name']} ({unit['type']} Unit) to incident location."

    # Update Response Unit status to ASSIGNED and bind incident
    cursor.execute(
        """
        UPDATE response_units
        SET status = ?, current_incident_id = ?
        WHERE id = ?;
        """,
        (UNIT_STATUS_ASSIGNED, incident_id, unit_id),
    )

    # Update Incident status to DISPATCHED
    cursor.execute(
        """
        UPDATE incidents
        SET status = ?, assigned_unit_id = ?, last_updated_at = ?
        WHERE id = ?;
        """,
        (target_status, unit_id, timestamp, incident_id),
    )

    # Record Audit Event
    cursor.execute(
        """
        INSERT INTO incident_events (
            incident_id, timestamp, from_state, to_state, actor, action, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (incident_id, timestamp, current_status, target_status, actor, "Dispatch Response Unit", dispatch_notes),
    )

    conn.commit()
    conn.close()

    return (
        jsonify({
            "success": True,
            "message": f"Unit {unit['name']} dispatched. Incident {incident_id} state changed to '{target_status}'.",
            "previous_state": current_status,
            "current_state": target_status,
            "assigned_unit": {"id": unit["id"], "name": unit["name"], "type": unit["type"]},
        }),
        200,
    )


@incidents_bp.route("/incidents/<incident_id>/respond", methods=["POST"])
def respond_incident(incident_id: str):
    """
    Transitions an incident from DISPATCHED to RESPONDING.
    The assigned unit enters BUSY state.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    current_status = row["status"]
    target_status = STATUS_RESPONDING

    is_valid, reason = validate_transition(current_status, target_status)
    if not is_valid:
        conn.close()
        return jsonify({"success": False, "error": reason, "current_state": current_status, "target_state": target_status}), 400

    data = request.get_json(silent=True) or {}
    notes = data.get("notes", "").strip() or "Assigned response unit arrived on-scene and commenced emergency operations."
    actor = data.get("actor", "").strip() or ACTOR_UNIT
    timestamp = get_utc_iso_timestamp()

    # If a unit was assigned, update unit to BUSY
    assigned_unit_id = row["assigned_unit_id"]
    if assigned_unit_id:
        cursor.execute(
            """
            UPDATE response_units
            SET status = ?
            WHERE id = ?;
            """,
            (UNIT_STATUS_BUSY, assigned_unit_id),
        )

    # Update Incident status to RESPONDING
    cursor.execute(
        """
        UPDATE incidents
        SET status = ?, last_updated_at = ?
        WHERE id = ?;
        """,
        (target_status, timestamp, incident_id),
    )

    # Record Audit Event
    cursor.execute(
        """
        INSERT INTO incident_events (
            incident_id, timestamp, from_state, to_state, actor, action, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (incident_id, timestamp, current_status, target_status, actor, "Accept & Start Response", notes),
    )

    conn.commit()
    conn.close()

    return (
        jsonify({
            "success": True,
            "message": f"Incident {incident_id} response commenced. State changed to '{target_status}'.",
            "previous_state": current_status,
            "current_state": target_status,
        }),
        200,
    )


@incidents_bp.route("/incidents/<incident_id>/resolve", methods=["POST"])
def resolve_incident(incident_id: str):
    """
    Transitions an incident from RESPONDING to RESOLVED.
    Frees the assigned unit back to AVAILABLE state.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    current_status = row["status"]
    target_status = STATUS_RESOLVED

    is_valid, reason = validate_transition(current_status, target_status)
    if not is_valid:
        conn.close()
        return jsonify({"success": False, "error": reason, "current_state": current_status, "target_state": target_status}), 400

    data = request.get_json(silent=True) or {}
    resolution_notes = (
        data.get("resolution_notes", "").strip()
        or "Emergency successfully mitigated and scene secured. Unit released."
    )
    actor = data.get("actor", "").strip() or ACTOR_COORDINATOR
    timestamp = get_utc_iso_timestamp()

    # Free the assigned unit back to AVAILABLE
    assigned_unit_id = row["assigned_unit_id"]
    if assigned_unit_id:
        cursor.execute(
            """
            UPDATE response_units
            SET status = ?, current_incident_id = NULL
            WHERE id = ?;
            """,
            (UNIT_STATUS_AVAILABLE, assigned_unit_id),
        )

    # Update Incident status to RESOLVED (terminal state)
    cursor.execute(
        """
        UPDATE incidents
        SET status = ?, resolution_notes = ?, last_updated_at = ?
        WHERE id = ?;
        """,
        (target_status, resolution_notes, timestamp, incident_id),
    )

    # Record Audit Event
    cursor.execute(
        """
        INSERT INTO incident_events (
            incident_id, timestamp, from_state, to_state, actor, action, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (incident_id, timestamp, current_status, target_status, actor, "Resolve Incident", resolution_notes),
    )

    conn.commit()
    conn.close()

    return (
        jsonify({
            "success": True,
            "message": f"Incident {incident_id} successfully resolved. State changed to '{target_status}'.",
            "previous_state": current_status,
            "current_state": target_status,
        }),
        200,
    )


@incidents_bp.route("/incidents/<incident_id>/transition", methods=["POST"])
def arbitrary_transition(incident_id: str):
    """
    Academic Demonstration Endpoint:
    Allows attempting an arbitrary state transition to demonstrate that the backend
    actively enforces validation and rejects illegal transitions (e.g., REPORTED -> RESOLVED).
    """
    data = request.get_json(silent=True) or {}
    target_status = data.get("target_status", "").strip().upper()

    if not target_status:
        return jsonify({"success": False, "error": "target_status is required for transition demonstration."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?;", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    current_status = row["status"]
    is_valid, reason = validate_transition(current_status, target_status)

    if not is_valid:
        conn.close()
        return (
            jsonify({
                "success": False,
                "error": reason,
                "violation": True,
                "current_state": current_status,
                "attempted_state": target_status,
                "allowed_next_states": VALID_TRANSITIONS.get(current_status, []),
            }),
            400,
        )

    conn.close()
    return jsonify({
        "success": True,
        "message": f"Transition from '{current_status}' to '{target_status}' is VALID under the ERCS State Model.",
        "current_state": current_status,
        "target_state": target_status,
    }), 200


@incidents_bp.route("/incidents/<incident_id>/events", methods=["GET"])
def get_incident_events(incident_id: str):
    """Returns the append-only event sequence history for an incident."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM incidents WHERE id = ?;", (incident_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": f"Incident '{incident_id}' not found."}), 404

    cursor.execute(
        """
        SELECT * FROM incident_events
        WHERE incident_id = ?
        ORDER BY id ASC;
        """,
        (incident_id,),
    )
    events = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({"success": True, "incident_id": incident_id, "count": len(events), "events": events}), 200
