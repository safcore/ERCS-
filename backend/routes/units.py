"""
ERCS Response Units Blueprint
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031
"""

from flask import Blueprint, request, jsonify
from models import (
    VALID_UNIT_STATUSES,
    VALID_UNIT_TYPES,
    UNIT_STATUS_AVAILABLE,
)
from database import get_db_connection

units_bp = Blueprint("units", __name__)


@units_bp.route("/response-units", methods=["GET"])
def get_response_units():
    """Returns all emergency response units with optional status or type filtering."""
    conn = get_db_connection()
    cursor = conn.cursor()

    status_filter = request.args.get("status")
    type_filter = request.args.get("type")

    query = """
        SELECT u.*, i.emergency_type as incident_type, i.location as incident_location, i.priority as incident_priority
        FROM response_units u
        LEFT JOIN incidents i ON u.current_incident_id = i.id
        WHERE 1=1
    """
    params = []

    if status_filter:
        query += " AND u.status = ?"
        params.append(status_filter)
    if type_filter:
        query += " AND u.type = ?"
        params.append(type_filter)

    query += " ORDER BY u.type ASC, u.id ASC;"

    cursor.execute(query, params)
    units = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({"success": True, "count": len(units), "units": units}), 200


@units_bp.route("/response-units", methods=["POST"])
def create_response_unit():
    """Registers a new response unit."""
    data = request.get_json(silent=True) or {}

    unit_id = data.get("id", "").strip().upper()
    name = data.get("name", "").strip()
    unit_type = data.get("type", "").strip()
    station_location = data.get("station_location", "").strip() or "Central Dispatch Hub"

    if not unit_id or not name or not unit_type:
        return jsonify({"success": False, "error": "id, name, and type are required."}), 400

    if unit_type not in VALID_UNIT_TYPES:
        return jsonify({"success": False, "error": f"Invalid unit type. Must be one of: {', '.join(VALID_UNIT_TYPES)}"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM response_units WHERE id = ?;", (unit_id,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": f"Response unit with ID '{unit_id}' already exists."}), 409

    cursor.execute(
        """
        INSERT INTO response_units (id, name, type, status, current_incident_id, station_location)
        VALUES (?, ?, ?, ?, NULL, ?);
        """,
        (unit_id, name, unit_type, UNIT_STATUS_AVAILABLE, station_location),
    )
    conn.commit()

    cursor.execute("SELECT * FROM response_units WHERE id = ?;", (unit_id,))
    created_unit = dict(cursor.fetchone())
    conn.close()

    return jsonify({"success": True, "unit": created_unit}), 201


@units_bp.route("/response-units/<unit_id>", methods=["GET"])
def get_response_unit(unit_id: str):
    """Retrieves a single response unit and its currently active incident."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT u.*, i.emergency_type as incident_type, i.location as incident_location, i.status as incident_status
        FROM response_units u
        LEFT JOIN incidents i ON u.current_incident_id = i.id
        WHERE u.id = ?;
        """,
        (unit_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": f"Response unit '{unit_id}' not found."}), 404

    return jsonify({"success": True, "unit": dict(row)}), 200
