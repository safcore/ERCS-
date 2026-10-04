"""
ERCS System Blueprint
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031
"""

from flask import Blueprint, jsonify
from database import reset_db
from models import get_academic_spec

system_bp = Blueprint("system", __name__)


@system_bp.route("/system/reset-demo", methods=["POST"])
def reset_demo():
    """Resets the SQLite database to the default demonstration seed state."""
    reset_db()
    return (
        jsonify({
            "success": True,
            "message": "Demo database successfully reset and re-seeded with initial incidents and response units.",
        }),
        200,
    )


@system_bp.route("/system/spec", methods=["GET"])
def get_spec():
    """Returns the formal academic specification for Sequence and State Modelling."""
    return jsonify({"success": True, "specification": get_academic_spec()}), 200


@system_bp.route("/system/health", methods=["GET"])
def health():
    """Basic health check endpoint."""
    return jsonify({"status": "healthy", "service": "ERCS Backend", "version": "1.0.0"}), 200
