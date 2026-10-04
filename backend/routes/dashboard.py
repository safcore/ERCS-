"""
ERCS Dashboard Statistics Blueprint
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031
"""

from flask import Blueprint, jsonify
from database import get_db_connection
from models import (
    ALL_INCIDENT_STATUSES,
    VALID_EMERGENCY_TYPES,
    VALID_PRIORITIES,
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    """Returns aggregated real-time statistics calculated from the SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Total incidents
    cursor.execute("SELECT COUNT(*) FROM incidents;")
    total_incidents = cursor.fetchone()[0]

    # 2. Status counts
    cursor.execute("SELECT status, COUNT(*) as count FROM incidents GROUP BY status;")
    status_counts_raw = {row["status"]: row["count"] for row in cursor.fetchall()}
    status_counts = {st: status_counts_raw.get(st, 0) for st in ALL_INCIDENT_STATUSES}

    # 3. Emergency Type distribution
    cursor.execute("SELECT emergency_type, COUNT(*) as count FROM incidents GROUP BY emergency_type;")
    type_counts_raw = {row["emergency_type"]: row["count"] for row in cursor.fetchall()}
    type_counts = {t: type_counts_raw.get(t, 0) for t in VALID_EMERGENCY_TYPES}

    # 4. Priority distribution
    cursor.execute("SELECT priority, COUNT(*) as count FROM incidents GROUP BY priority;")
    priority_counts_raw = {row["priority"]: row["count"] for row in cursor.fetchall()}
    priority_counts = {p: priority_counts_raw.get(p, 0) for p in VALID_PRIORITIES}

    # 5. Response unit statistics
    cursor.execute("SELECT COUNT(*) FROM response_units;")
    total_units = cursor.fetchone()[0]

    cursor.execute("SELECT status, COUNT(*) as count FROM response_units GROUP BY status;")
    unit_status_raw = {row["status"]: row["count"] for row in cursor.fetchall()}
    unit_stats = {
        "total": total_units,
        "available": unit_status_raw.get("AVAILABLE", 0),
        "assigned": unit_status_raw.get("ASSIGNED", 0),
        "busy": unit_status_raw.get("BUSY", 0),
    }

    # 6. Recent incidents
    cursor.execute(
        """
        SELECT i.id, i.emergency_type, i.location, i.priority, i.status, i.reported_at, i.last_updated_at,
               u.name as unit_name
        FROM incidents i
        LEFT JOIN response_units u ON i.assigned_unit_id = u.id
        ORDER BY i.reported_at DESC
        LIMIT 6;
        """
    )
    recent_incidents = [dict(row) for row in cursor.fetchall()]

    # 7. Recent activity events
    cursor.execute(
        """
        SELECT id, incident_id, timestamp, from_state, to_state, actor, action, notes
        FROM incident_events
        ORDER BY id DESC
        LIMIT 6;
        """
    )
    recent_events = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return (
        jsonify({
            "success": True,
            "total_incidents": total_incidents,
            "status_counts": status_counts,
            "type_counts": type_counts,
            "priority_counts": priority_counts,
            "unit_stats": unit_stats,
            "recent_incidents": recent_incidents,
            "recent_events": recent_events,
        }),
        200,
    )
