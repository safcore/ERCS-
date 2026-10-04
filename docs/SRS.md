# Software Requirements Specification (SRS)
## Emergency Response Coordination System (ERCS)

**Course:** Software Engineering Practices (SEP)  
**Student Roll No:** 124BTCS1031  
**Project Title:** Sequence and State Modelling of an Emergency Response Coordination System  
**Sustainable Development Goal:** SDG 11 – Sustainable Cities and Communities (Target 11.5)  

---

## 1. Introduction

### 1.1 Purpose
This document provides the formal Software Requirements Specification (SRS) for the **Emergency Response Coordination System (ERCS)**. ERCS is an academic software prototype developed for the Software Engineering Practices (SEP) micro project. It models and demonstrates how emergency incidents transition through a rigorous, rule-bound lifecycle and how multiple distinct actors interact sequentially to safeguard urban communities.

### 1.2 Scope
The ERCS platform coordinates urban emergency incidents across five deterministic states (`REPORTED`, `VERIFIED`, `DISPATCHED`, `RESPONDING`, `RESOLVED`). It provides:
1. Citizen incident reporting with automated ID allocation.
2. Coordinator verification mechanisms.
3. Fleet management and availability-constrained dispatch.
4. Response unit active operational tracking.
5. Incident mitigation, resolution, and unit reclamation.
6. Server-enforced invariant checking to prevent invalid state shifts.
7. An append-only chronological audit log preserving the interaction sequence.

*Explicitly Excluded:* Machine learning predictions, IoT hardware, external third-party SMS/WhatsApp gateways, real 911/112 CAD feeds, payment systems, and distributed cloud orchestrators.

### 1.3 Definitions, Acronyms, and Abbreviations
- **ERCS:** Emergency Response Coordination System
- **FSM:** Finite State Machine
- **SDG:** Sustainable Development Goals (United Nations)
- **RU:** Response Unit (e.g., Fire Engine, Ambulance, Police Patrol)
- **SEP:** Software Engineering Practices

---

## 2. Overall Description

### 2.1 Product Perspective
ERCS operates as a two-tier decoupled system comprising a lightweight Python/Flask RESTful backend backed by an embedded SQLite database, and a high-performance React (Vite) single-page application dashboard.

```
+--------------------------------------------------------+
|                     User Actors                        |
|  [Emergency Reporter]  [Coordinator]  [Response Unit]   |
+--------------------------------------------------------+
                           |
                           v
+--------------------------------------------------------+
|             React Single Page Application             |
|   Dashboard | Incident Registry | FSM Action Toolbar  |
+--------------------------------------------------------+
                           |  (REST JSON over HTTP)
                           v
+--------------------------------------------------------+
|                   Flask REST API                       |
|   State Transition Engine | Fleet Dispatch Controller  |
+--------------------------------------------------------+
                           |
                           v
+--------------------------------------------------------+
|                 SQLite Database                        |
|   incidents | response_units | incident_events (Log)   |
+--------------------------------------------------------+
```

### 2.2 System Actors
1. **Emergency Reporter:** Submits emergencies (type, location, description, severity).
2. **Emergency Coordinator:** Verifies authenticity, dispatches available response units, and resolves closed incidents.
3. **Response Unit:** Receives assignment, mobilizes, and marks arrival on-scene.
4. **System:** Enforces state rules, assigns IDs, records events, and frees resources.

### 2.3 Operating Environment
- **Operating System:** Microsoft Windows 10/11
- **Backend Runtime:** Python 3.10+ (Flask 3.1+)
- **Frontend Runtime:** Node.js v20+ / npm (Vite 8+)
- **Database:** SQLite 3 (zero-configuration embedded engine)
- **Client Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox

---

## 3. Specific Requirements

### 3.1 Functional Requirements (FR)

| Req ID | Requirement Title | Description |
|---|---|---|
| **FR-01** | Emergency Intake | The system shall accept new emergency reports containing `emergency_type`, `location`, `description`, and `priority`, automatically assign an `ER-XXX` identifier, and initialize the state to `REPORTED`. |
| **FR-02** | Initial State Invariant | All freshly recorded incidents must enter state `REPORTED`. No incident may skip directly to any downstream state. |
| **FR-03** | Incident Verification | The Coordinator actor can transition an incident from `REPORTED` to `VERIFIED`, appending verification notes to the incident record. |
| **FR-04** | Unit Fleet Validation | The system shall maintain response unit states: `AVAILABLE`, `ASSIGNED`, `BUSY`. Units can only be dispatched if their state is strictly `AVAILABLE`. |
| **FR-05** | Response Dispatch | The Coordinator can dispatch an available unit to a `VERIFIED` incident, advancing incident state to `DISPATCHED` and unit state to `ASSIGNED`. |
| **FR-06** | Response Commencement | The assigned unit can accept the call, advancing incident state from `DISPATCHED` to `RESPONDING`, and unit state from `ASSIGNED` to `BUSY`. |
| **FR-07** | Incident Resolution | The Coordinator can transition an incident from `RESPONDING` to `RESOLVED`, releasing the bound unit back to `AVAILABLE` and storing resolution notes. |
| **FR-08** | Invariant Enforcement | The backend must reject all non-adjacent or non-permitted state transitions (e.g. `REPORTED -> RESOLVED`, `REPORTED -> RESPONDING`) with HTTP status 400 Bad Request. |
| **FR-09** | Terminal State Integrity | The state `RESOLVED` is terminal. Once an incident is marked `RESOLVED`, no further state transitions shall be permitted. |
| **FR-10** | Append-Only Event Trail | Every state transition and creation action must record an immutable entry into `incident_events` containing timestamp, actor, previous state, new state, and notes. |
| **FR-11** | Demonstration Reset | The system shall provide an endpoint (`POST /api/system/reset-demo`) to restore the database to a baseline demonstration seed state. |

### 3.2 Non-Functional Requirements (NFR)

- **NFR-01 (Performance & Latency):** Local API response latency for all transition endpoints must be under 100 milliseconds.
- **NFR-02 (Data Integrity):** Parameterized SQL queries shall be used exclusively to eliminate SQL injection vulnerabilities. SQLite foreign key constraints (`PRAGMA foreign_keys = ON;`) must be strictly enabled.
- **NFR-03 (Usability & Presentation):** The user interface shall provide instant visual cues indicating permitted versus disabled actions, accompanied by an explicit academic validator panel.
- **NFR-04 (Traceability):** Every state transition must be 100% auditable via the append-only event log.
