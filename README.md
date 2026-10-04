# Emergency Response Coordination System (ERCS)
### Sequence and State Modelling of an Emergency Response Coordination System

**Academic Course:** Software Engineering Practices (SEP) — CIAP Micro Project  
**Student Roll No:** 124BTCS1031  
**United Nations Sustainable Development Goal:** SDG 11 – Sustainable Cities and Communities (Target 11.5)  

---

## 1. Problem Definition & Objective

In urban emergency scenarios (fires, traffic accidents, medical crises, and structural hazards), rapid coordination and strict workflow integrity save lives. Disjointed emergency dispatching often suffers from:
- Ambiguous incident progression (unclear whether an emergency was verified or dispatch occurred).
- Resource contention (dispatching units that are already busy).
- Premature or illegal state transitions (marking incidents closed without verification).
- Absence of chronological audit logs to verify accountability.

**Objective:**  
To design, model, implement, and verify a complete software prototype that demonstrates **Sequence Modelling** (chronological actor-system interactions) and **State Modelling** (strict Finite State Machine lifecycle rules) for an urban emergency response coordination center.

---

## 2. Core State Model & Lifecycle

Every emergency incident follows a deterministic 5-stage lifecycle:

```
[ REPORTED ] ──(Verify)──> [ VERIFIED ] ──(Dispatch Available Unit)──> [ DISPATCHED ] ──(Start Response)──> [ RESPONDING ] ──(Mitigate & Resolve)──> [ RESOLVED ]
```

### State Machine Transition Rules

| From State | Allowed Target State | Preconditions & Actions |
|---|---|---|
| `REPORTED` | `VERIFIED` | Coordinator confirms incident authenticity. |
| `VERIFIED` | `DISPATCHED` | Coordinator assigns a response unit with status `AVAILABLE`. Unit transitions to `ASSIGNED`. |
| `DISPATCHED` | `RESPONDING` | Assigned response unit commences on-scene operations. Unit transitions to `BUSY`. |
| `RESPONDING` | `RESOLVED` | Hazard neutralized. Incident marked `RESOLVED`. Assigned unit is freed back to `AVAILABLE`. |
| `RESOLVED` | *(None)* | **Terminal State.** No further transitions allowed. |

### Invalid Transitions (Server-Enforced Rejections)
- `REPORTED` → `RESOLVED` = ✗ **REJECTED (400 Bad Request)**
- `REPORTED` → `RESPONDING` = ✗ **REJECTED (400 Bad Request)**
- `REPORTED` → `DISPATCHED` = ✗ **REJECTED (400 Bad Request)**
- `VERIFIED` → `RESOLVED` = ✗ **REJECTED (400 Bad Request)**
- `DISPATCHED` → `RESOLVED` = ✗ **REJECTED (400 Bad Request)**

---

## 3. Technology Stack

- **Backend:** Python 3.10+ / Flask 3.1
- **API Architecture:** RESTful JSON API with parameterized SQLite queries
- **Frontend:** React 19 / Vite 8 / Modern CSS Component Design System
- **Icons:** Lucide React
- **Testing:** pytest 9.1 with automated Flask test client
- **Database:** SQLite 3 (embedded `ercs.db`)
- **Host OS:** Microsoft Windows 10/11

---

## 4. Project Directory Structure

```
SEP_CIAP/
│
├── backend/
│   ├── app.py                   # Flask Application Factory & Route Registration
│   ├── database.py              # SQLite Schema, Seeding & Query Helpers
│   ├── models.py                # FSM Transition Rules & Domain Constants
│   ├── requirements.txt         # Python Dependencies (flask, flask-cors, pytest)
│   ├── ercs.db                  # Local SQLite Database File
│   └── routes/
│       ├── incidents.py         # Incident Intake, CRUD & State Transition Endpoints
│       ├── units.py             # Response Unit Fleet Management
│       ├── dashboard.py         # Real-time Statistics & Breakdown Aggregations
│       └── system.py            # Reset Demo & Academic Specification Endpoints
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header, Actor Switcher & Reset Button
│   │   │   ├── StateBadge.jsx           # Semantic Status Badges
│   │   │   ├── PriorityBadge.jsx        # Severity Priority Badges
│   │   │   ├── StateProgressStepper.jsx # 5-Step Visual Stepper
│   │   │   ├── Modal.jsx                # Accessible Modal Dialog
│   │   │   └── Toast.jsx                # Notification Toasts
│   │   ├── views/
│   │   │   ├── DashboardView.jsx        # Command Metrics & Charts
│   │   │   ├── IncidentsListView.jsx    # Searchable & Filterable Registry
│   │   │   ├── IncidentDetailsView.jsx  # FSM Action Toolbar & Academic Validator
│   │   │   ├── ReportIncidentView.jsx   # Emergency Intake Form
│   │   │   ├── ResponseUnitsView.jsx    # Fleet Availability Tracker
│   │   │   ├── ActivityLogView.jsx      # System Audit Log
│   │   │   └── AcademicModelView.jsx    # UML Model & Viva Voce Guide
│   │   ├── api.js                       # Frontend REST API Client
│   │   ├── types.js                     # Constants & Badge Definitions
│   │   ├── App.jsx                      # Main View Router & State
│   │   └── index.css                    # Professional Design System CSS
│   ├── vite.config.js                   # Vite Config with Backend Proxy
│   └── package.json                     # Frontend npm Dependencies
│
├── tests/
│   └── test_ercs.py             # 14 Automated Backend Pytest Verification Tests
│
├── docs/
│   ├── SRS.md                   # Software Requirements Specification
│   ├── DDS.md                   # Detailed Design Specification with Mermaid UML
│   └── VIVA_GUIDE.md            # Student Viva Voce Defense Walkthrough
│
└── README.md                    # Project Documentation & Windows Run Instructions
```

---

## 5. Local Setup & Execution Guide (Windows)

Open two terminal windows in the project root: `C:\Users\samnani\OneDrive\Desktop\Projects\SEP_CIAP`.

### Step 1: Run the Flask Backend (Terminal 1)

```powershell
# Navigate to project root
cd C:\Users\samnani\OneDrive\Desktop\Projects\SEP_CIAP

# Activate the Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# (Optional: If activating scripts is restricted on Windows, run directly):
# .\backend\venv\Scripts\python.exe backend\app.py

# Start the Flask backend server
python backend\app.py
```

*Output should indicate:*
```
==================================================
ERCS Backend running on http://127.0.0.1:5000
Roll No: 124BTCS1031 | Course: SEP Micro Project
==================================================
```

---

### Step 2: Run the React / Vite Frontend (Terminal 2)

```powershell
# Open a second terminal window
cd C:\Users\samnani\OneDrive\Desktop\Projects\SEP_CIAP\frontend

# Start the Vite development server
npm run dev
```

*Output should indicate:*
```
  VITE v8.3.2  ready in 180 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 3: Open in Browser

Open Google Chrome or Microsoft Edge and navigate to:
**`http://localhost:5173`**

---

## 6. Running Automated Backend Tests

The automated test suite verifies all 12 core requirements, invalid transition rejection, unit availability guards, and audit trail fidelity.

Execute the following command in PowerShell:

```powershell
backend\venv\Scripts\pytest.exe tests/test_ercs.py -v
```

### Test Suite Results:
```
tests/test_ercs.py::test_01_create_incident PASSED                       [  7%]
tests/test_ercs.py::test_02_required_field_validation PASSED             [ 14%]
tests/test_ercs.py::test_03_correct_initial_state PASSED                 [ 21%]
tests/test_ercs.py::test_04_transition_reported_to_verified PASSED       [ 28%]
tests/test_ercs.py::test_05_transition_verified_to_dispatched PASSED     [ 35%]
tests/test_ercs.py::test_06_transition_dispatched_to_responding PASSED   [ 42%]
tests/test_ercs.py::test_07_transition_responding_to_resolved PASSED     [ 50%]
tests/test_ercs.py::test_08_invalid_transition_reported_to_resolved PASSED [ 57%]
tests/test_ercs.py::test_09_invalid_transition_reported_to_responding PASSED [ 64%]
tests/test_ercs.py::test_10_invalid_incident_id PASSED                   [ 71%]
tests/test_ercs.py::test_11_assign_available_unit PASSED                 [ 78%]
tests/test_ercs.py::test_12_reject_unavailable_unit PASSED               [ 85%]
tests/test_ercs.py::test_13_terminal_resolved_state_immutable PASSED     [ 92%]
tests/test_ercs.py::test_14_incident_events_audit_log PASSED             [100%]

============================= 14 passed in 0.37s ==============================
```

---

## 7. Key REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated metrics, type/priority distributions, fleet counts |
| `GET` | `/api/incidents` | List incidents with search and filter queries |
| `POST` | `/api/incidents` | Intake new incident in state `REPORTED` |
| `GET` | `/api/incidents/<id>` | Full incident details with permitted next states |
| `POST` | `/api/incidents/<id>/verify` | Transition from `REPORTED` → `VERIFIED` |
| `POST` | `/api/incidents/<id>/dispatch` | Transition `VERIFIED` → `DISPATCHED` (requires `unit_id`) |
| `POST` | `/api/incidents/<id>/respond` | Transition `DISPATCHED` → `RESPONDING` (unit becomes `BUSY`) |
| `POST` | `/api/incidents/<id>/resolve` | Transition `RESPONDING` → `RESOLVED` (unit freed to `AVAILABLE`) |
| `POST` | `/api/incidents/<id>/transition`| **Academic Validator:** Test arbitrary transitions |
| `GET` | `/api/incidents/<id>/events` | Append-only chronological sequence audit trail |
| `GET` | `/api/response-units` | Fleet availability status and current deployments |
| `POST` | `/api/system/reset-demo` | Resets SQLite database to demonstration seed records |
| `GET` | `/api/system/spec` | Returns formal state & sequence specifications JSON |

---

## 8. Academic Deliverables & Viva Documentation

Comprehensive documentation has been prepared inside the `docs/` folder:
- **`docs/SRS.md`**: Complete Software Requirements Specification covering Functional and Non-Functional requirements, stakeholders, and operational environment.
- **`docs/DDS.md`**: Detailed Design Specification containing Mermaid UML diagrams (System Architecture, Use Case, Sequence Diagram, State Diagram, ER Diagram, and DFD Levels 0 & 1).
- **`docs/VIVA_GUIDE.md`**: Two-minute elevator pitch, 5-minute live demonstration script, and top 10 anticipated viva questions with answers.

---

## 9. Future Scope

While the current prototype strictly focuses on deterministic sequence and state modelling without extraneous dependencies, future enterprise enhancements may include:
1. Integration with GIS map coordinates (Leaflet / OpenStreetMap).
2. Real-time vehicle telemetry via WebSockets.
3. Role-Based Access Control (RBAC) with JWT authentication.
4. Mobile telemetry app for field response units.
