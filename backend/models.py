"""
ERCS Models & State Transition Engine
Software Engineering Practices (SEP) Micro Project
Student Roll No: 124BTCS1031
SDG 11: Sustainable Cities and Communities
"""

from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional

# Core Incident Lifecycles
STATUS_REPORTED = "REPORTED"
STATUS_VERIFIED = "VERIFIED"
STATUS_DISPATCHED = "DISPATCHED"
STATUS_RESPONDING = "RESPONDING"
STATUS_RESOLVED = "RESOLVED"

ALL_INCIDENT_STATUSES = [
    STATUS_REPORTED,
    STATUS_VERIFIED,
    STATUS_DISPATCHED,
    STATUS_RESPONDING,
    STATUS_RESOLVED,
]

# Strict Finite State Machine (FSM) Transitions
VALID_TRANSITIONS: Dict[str, List[str]] = {
    STATUS_REPORTED: [STATUS_VERIFIED],
    STATUS_VERIFIED: [STATUS_DISPATCHED],
    STATUS_DISPATCHED: [STATUS_RESPONDING],
    STATUS_RESPONDING: [STATUS_RESOLVED],
    STATUS_RESOLVED: [],  # Terminal state
}

# Domain Validations
VALID_EMERGENCY_TYPES = [
    "Fire",
    "Medical",
    "Accident",
    "Security",
    "Natural Disaster",
]

VALID_PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]

# Response Unit Lifecycles
UNIT_STATUS_AVAILABLE = "AVAILABLE"
UNIT_STATUS_ASSIGNED = "ASSIGNED"
UNIT_STATUS_BUSY = "BUSY"

VALID_UNIT_STATUSES = [
    UNIT_STATUS_AVAILABLE,
    UNIT_STATUS_ASSIGNED,
    UNIT_STATUS_BUSY,
]

VALID_UNIT_TYPES = [
    "Fire",
    "Medical",
    "Police",
    "Rescue",
]

# Actors in the Sequence Model
ACTOR_REPORTER = "Emergency Reporter"
ACTOR_COORDINATOR = "Emergency Coordinator"
ACTOR_UNIT = "Response Unit"
ACTOR_SYSTEM = "System"


def get_utc_iso_timestamp() -> str:
    """Returns current UTC timestamp formatted as ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def validate_transition(current_status: str, target_status: str) -> Tuple[bool, Optional[str]]:
    """
    Validates whether transitioning an incident from `current_status`
    to `target_status` complies with the ERCS State Model.

    Returns:
        (True, None) if transition is valid.
        (False, reason_string) if invalid.
    """
    if current_status not in VALID_TRANSITIONS:
        return False, f"Unknown current state '{current_status}'."

    if target_status not in ALL_INCIDENT_STATUSES:
        return False, f"Target state '{target_status}' is not a recognized ERCS incident status."

    if current_status == STATUS_RESOLVED:
        return False, f"Incident is already RESOLVED (terminal state). No further transitions permitted."

    allowed_next_states = VALID_TRANSITIONS.get(current_status, [])

    if target_status not in allowed_next_states:
        expected = ", ".join(allowed_next_states) if allowed_next_states else "None"
        return False, (
            f"Invalid state transition: Cannot transition from '{current_status}' "
            f"directly to '{target_status}'. Allowed next state(s): [{expected}]."
        )

    return True, None


def get_academic_spec() -> dict:
    """Returns the formal Sequence and State Model specifications for academic viva & inspection."""
    return {
        "project": "Emergency Response Coordination System (ERCS)",
        "course": "Software Engineering Practices (SEP)",
        "student_roll_no": "124BTCS1031",
        "sdg_target": "SDG 11 - Sustainable Cities and Communities",
        "lifecycle_states": ALL_INCIDENT_STATUSES,
        "valid_transitions": VALID_TRANSITIONS,
        "sequence_flow": [
            {
                "step": 1,
                "actor": ACTOR_REPORTER,
                "action": "Report Emergency",
                "system_response": "Creates incident record with state REPORTED, generates Incident ID, logs event",
                "resulting_state": STATUS_REPORTED,
            },
            {
                "step": 2,
                "actor": ACTOR_COORDINATOR,
                "action": "Verify Incident",
                "system_response": "Validates incident legitimacy, records verification notes, advances state to VERIFIED",
                "resulting_state": STATUS_VERIFIED,
            },
            {
                "step": 3,
                "actor": ACTOR_COORDINATOR,
                "action": "Dispatch Response Unit",
                "system_response": "Verifies unit availability, binds unit to incident, sets unit to ASSIGNED, advances state to DISPATCHED",
                "resulting_state": STATUS_DISPATCHED,
            },
            {
                "step": 4,
                "actor": ACTOR_UNIT,
                "action": "Accept & Start Response",
                "system_response": "Unit departs station, sets unit status to BUSY, advances incident state to RESPONDING",
                "resulting_state": STATUS_RESPONDING,
            },
            {
                "step": 5,
                "actor": ACTOR_COORDINATOR,
                "action": "Resolve Incident",
                "system_response": "Emergency mitigated, sets incident state to RESOLVED (terminal), frees unit back to AVAILABLE",
                "resulting_state": STATUS_RESOLVED,
            },
        ],
    }
