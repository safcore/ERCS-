"""
ERCS Database Module
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031
Database: SQLite with Parameterized Queries & Foreign Keys
"""

import os
import sqlite3
from datetime import datetime, timezone, timedelta
from typing import Optional
from flask import current_app, has_app_context

DB_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ercs.db")


def get_db_path(explicit_path: Optional[str] = None) -> str:
    """Resolves database path from explicit argument, Flask current_app config, or default file."""
    if explicit_path:
        return explicit_path
    if has_app_context() and current_app.config.get("DATABASE"):
        return current_app.config["DATABASE"]
    return DB_FILE_PATH


def get_db_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Creates a database connection with dictionary-like row access and foreign key enforcement."""
    target_path = get_db_path(db_path)
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn



def init_db(db_path: Optional[str] = None) -> None:
    """Initializes tables and seeds demonstrative data if database is new or empty."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()

    # Table 1: response_units
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS response_units (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('AVAILABLE', 'ASSIGNED', 'BUSY')),
            current_incident_id TEXT,
            station_location TEXT NOT NULL
        );
    """)

    # Table 2: incidents
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            emergency_type TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            status TEXT NOT NULL CHECK(status IN ('REPORTED', 'VERIFIED', 'DISPATCHED', 'RESPONDING', 'RESOLVED')),
            reported_by TEXT NOT NULL,
            contact_number TEXT,
            reported_at TEXT NOT NULL,
            last_updated_at TEXT NOT NULL,
            assigned_unit_id TEXT,
            verification_notes TEXT,
            resolution_notes TEXT,
            FOREIGN KEY (assigned_unit_id) REFERENCES response_units(id) ON DELETE SET NULL
        );
    """)

    # Table 3: incident_events (Append-only Audit Log / Sequence Timeline)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incident_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            from_state TEXT,
            to_state TEXT NOT NULL,
            actor TEXT NOT NULL,
            action TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
        );
    """)

    conn.commit()

    # Check if units exist; if not, seed demo data
    cursor.execute("SELECT COUNT(*) FROM response_units;")
    unit_count = cursor.fetchone()[0]
    if unit_count == 0:
        seed_data(conn)

    conn.close()


def seed_data(conn: sqlite3.Connection) -> None:
    """Seeds initial demonstration data covering all lifecycle states and units."""
    cursor = conn.cursor()

    # Clean existing data if reseeding
    cursor.execute("DELETE FROM incident_events;")
    cursor.execute("DELETE FROM incidents;")
    cursor.execute("DELETE FROM response_units;")

    # 1. Seed Response Units
    units = [
        ("RU-FIRE-01", "Fire Unit 01", "Fire", "AVAILABLE", None, "Andheri Fire Station"),
        ("RU-FIRE-02", "Fire Unit 02", "Fire", "AVAILABLE", None, "Bandra Fire Station"),
        ("RU-AMB-01", "Ambulance 01", "Medical", "AVAILABLE", None, "General Hospital Station"),
        ("RU-AMB-02", "Ambulance 02", "Medical", "AVAILABLE", None, "Suburban Trauma Center"),
        ("RU-POL-01", "Police Unit 01", "Police", "ASSIGNED", "ER-003", "Powai Traffic HQ"),
        ("RU-RESCUE-01", "Rescue Unit 01", "Rescue", "BUSY", "ER-004", "City Disaster Management Base"),
    ]

    cursor.executemany(
        """
        INSERT INTO response_units (id, name, type, status, current_incident_id, station_location)
        VALUES (?, ?, ?, ?, ?, ?);
        """,
        units,
    )

    now = datetime.now(timezone.utc)
    fmt = lambda dt: dt.isoformat()

    # 2. Seed Incidents representing all stages
    incidents = [
        # ER-001: REPORTED
        (
            "ER-001",
            "Fire",
            "Andheri West, Link Road (Near Metro Pillar 42)",
            "Commercial complex electrical transformer fire on 2nd floor. Heavy smoke visible.",
            "HIGH",
            "REPORTED",
            "Aarav Sharma (Citizen)",
            "+91 98201 12345",
            fmt(now - timedelta(minutes=15)),
            fmt(now - timedelta(minutes=15)),
            None,
            None,
            None,
        ),
        # ER-002: VERIFIED
        (
            "ER-002",
            "Medical",
            "Bandra West, Hill Road",
            "Multiple-vehicle collision with severe pedestrian injuries requiring immediate trauma care.",
            "CRITICAL",
            "VERIFIED",
            "Priya Nair (Store Manager)",
            "+91 98202 23456",
            fmt(now - timedelta(minutes=35)),
            fmt(now - timedelta(minutes=25)),
            None,
            "Coordinator verified with local traffic officer on duty. Incident confirmed authentic.",
            None,
        ),
        # ER-003: DISPATCHED
        (
            "ER-003",
            "Accident",
            "Powai, JVLR Junction",
            "Two-car collision causing traffic blockade; minor passenger shock reported.",
            "MEDIUM",
            "DISPATCHED",
            "Rohan Mehta (Motorist)",
            "+91 98203 34567",
            fmt(now - timedelta(minutes=50)),
            fmt(now - timedelta(minutes=20)),
            "RU-POL-01",
            "Traffic control room verified CCTV stream.",
            None,
        ),
        # ER-004: RESPONDING
        (
            "ER-004",
            "Security",
            "Kurla Station Road",
            "Commercial billboard collapsed onto sidewalk creating hazard. Crowd management needed.",
            "HIGH",
            "RESPONDING",
            "Sunil Gupta (Commuter)",
            "+91 98204 45678",
            fmt(now - timedelta(minutes=70)),
            fmt(now - timedelta(minutes=10)),
            "RU-RESCUE-01",
            "Municipal ward officer verified structure collapse.",
            None,
        ),
        # ER-005: RESOLVED
        (
            "ER-005",
            "Natural Disaster",
            "Dadar Chowpatty Promenade",
            "High-tide localized waterlogging across pedestrian pathway.",
            "LOW",
            "RESOLVED",
            "Kavita Deshmukh (Resident)",
            "+91 98205 56789",
            fmt(now - timedelta(hours=3)),
            fmt(now - timedelta(hours=1)),
            None,
            "Monitored via coastal surveillance camera.",
            "Storm water drainage pumps operational. Roadway cleared and safe for public.",
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO incidents (
            id, emergency_type, location, description, priority,
            status, reported_by, contact_number, reported_at,
            last_updated_at, assigned_unit_id, verification_notes, resolution_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        incidents,
    )

    # 3. Seed Incident Events (Audit Trail for Sequence Modelling)
    events = [
        # ER-001 events
        (
            "ER-001",
            fmt(now - timedelta(minutes=15)),
            None,
            "REPORTED",
            "Emergency Reporter",
            "Report Emergency",
            "Citizen registered incident via portal.",
        ),
        # ER-002 events
        (
            "ER-002",
            fmt(now - timedelta(minutes=35)),
            None,
            "REPORTED",
            "Emergency Reporter",
            "Report Emergency",
            "Incident submitted by store manager Priya Nair.",
        ),
        (
            "ER-002",
            fmt(now - timedelta(minutes=25)),
            "REPORTED",
            "VERIFIED",
            "Emergency Coordinator",
            "Verify Incident",
            "Coordinator verified with local traffic officer on duty. Incident confirmed authentic.",
        ),
        # ER-003 events
        (
            "ER-003",
            fmt(now - timedelta(minutes=50)),
            None,
            "REPORTED",
            "Emergency Reporter",
            "Report Emergency",
            "Accident reported at JVLR Junction.",
        ),
        (
            "ER-003",
            fmt(now - timedelta(minutes=35)),
            "REPORTED",
            "VERIFIED",
            "Emergency Coordinator",
            "Verify Incident",
            "Verified via CCTV feed.",
        ),
        (
            "ER-003",
            fmt(now - timedelta(minutes=20)),
            "VERIFIED",
            "DISPATCHED",
            "Emergency Coordinator",
            "Dispatch Response Unit",
            "Dispatched Police Unit 01 (RU-POL-01) to secure junction.",
        ),
        # ER-004 events
        (
            "ER-004",
            fmt(now - timedelta(minutes=70)),
            None,
            "REPORTED",
            "Emergency Reporter",
            "Report Emergency",
            "Billboard structural hazard reported.",
        ),
        (
            "ER-004",
            fmt(now - timedelta(minutes=45)),
            "REPORTED",
            "VERIFIED",
            "Emergency Coordinator",
            "Verify Incident",
            "Ward officer confirmed incident site.",
        ),
        (
            "ER-004",
            fmt(now - timedelta(minutes=30)),
            "VERIFIED",
            "DISPATCHED",
            "Emergency Coordinator",
            "Dispatch Response Unit",
            "Assigned Rescue Unit 01 (RU-RESCUE-01).",
        ),
        (
            "ER-004",
            fmt(now - timedelta(minutes=10)),
            "DISPATCHED",
            "RESPONDING",
            "Response Unit",
            "Accept & Start Response",
            "Rescue Unit 01 arrived on-scene and commenced perimeter cordoning.",
        ),
        # ER-005 events
        (
            "ER-005",
            fmt(now - timedelta(hours=3)),
            None,
            "REPORTED",
            "Emergency Reporter",
            "Report Emergency",
            "Waterlogging reported by resident.",
        ),
        (
            "ER-005",
            fmt(now - timedelta(hours=2, minutes=40)),
            "REPORTED",
            "VERIFIED",
            "Emergency Coordinator",
            "Verify Incident",
            "Verified by coastal monitoring patrol.",
        ),
        (
            "ER-005",
            fmt(now - timedelta(hours=2, minutes=20)),
            "VERIFIED",
            "DISPATCHED",
            "Emergency Coordinator",
            "Dispatch Response Unit",
            "Temporary municipal pump team assigned.",
        ),
        (
            "ER-005",
            fmt(now - timedelta(hours=2)),
            "DISPATCHED",
            "RESPONDING",
            "Response Unit",
            "Accept & Start Response",
            "Pumping began.",
        ),
        (
            "ER-005",
            fmt(now - timedelta(hours=1)),
            "RESPONDING",
            "RESOLVED",
            "Emergency Coordinator",
            "Resolve Incident",
            "Storm water drainage pumps operational. Roadway cleared and safe for public.",
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO incident_events (
            incident_id, timestamp, from_state, to_state, actor, action, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        events,
    )

    conn.commit()


def reset_db(db_path: Optional[str] = None) -> None:
    """Resets database and re-seeds it with demonstration data."""
    conn = get_db_connection(db_path)
    seed_data(conn)
    conn.close()
