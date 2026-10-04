"""
Emergency Response Coordination System (ERCS) Backend Application
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031 | SDG 11: Sustainable Cities and Communities
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

from database import init_db
from routes.incidents import incidents_bp
from routes.units import units_bp
from routes.dashboard import dashboard_bp
from routes.system import system_bp


def create_app(db_path: str = None) -> Flask:
    """Application factory for ERCS Flask Backend."""
    app = Flask(__name__)
    if db_path:
        app.config["DATABASE"] = db_path

    # Enable Cross-Origin Resource Sharing for Vite frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # Initialize SQLite Database & demo records
    init_db(db_path)

    # Register API blueprints
    app.register_blueprint(incidents_bp, url_prefix="/api")
    app.register_blueprint(units_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(system_bp, url_prefix="/api")

    # Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "error": "Method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "error": "Internal server error"}), 500

    @app.route("/")
    def index():
        return jsonify({
            "project": "Emergency Response Coordination System (ERCS) API",
            "course": "Software Engineering Practices (SEP)",
            "student_roll_no": "124BTCS1031",
            "sdg": "SDG 11 - Sustainable Cities and Communities",
            "api_docs": "/api/system/spec",
            "status": "online",
        })

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    print(f"==================================================")
    print(f"ERCS Backend running on http://127.0.0.1:{port}")
    print(f"Roll No: 124BTCS1031 | Course: SEP Micro Project")
    print(f"==================================================")
    app.run(host="127.0.0.1", port=port, debug=True)
