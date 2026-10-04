# Detailed Design Specification (DDS)
## Emergency Response Coordination System (ERCS)

**Course:** Software Engineering Practices (SEP)  
**Student Roll No:** 124BTCS1031  
**Project Title:** Sequence and State Modelling of an Emergency Response Coordination System  
**Sustainable Development Goal:** SDG 11 – Sustainable Cities and Communities  

---

## 1. System Architecture

ERCS is designed according to a clean Model-View-Controller (MVC) / Client-Server architectural pattern.

```mermaid
graph TD
    subgraph Client ["Frontend (React + Vite)"]
        UI_Dash["Dashboard View"]
        UI_Inc["Incident Registry"]
        UI_Det["Incident Details & FSM Stepper"]
        UI_Rep["Report Emergency Form"]
        UI_Unit["Response Units Fleet"]
        UI_Model["Academic Modeling Explorer"]
    end

    subgraph API ["REST API Layer (Python Flask)"]
        R_Inc["/api/incidents Routes"]
        R_Unit["/api/response-units Routes"]
        R_Dash["/api/dashboard Routes"]
        R_Sys["/api/system Routes"]
        FSM["State Machine Engine (models.py)"]
    end

    subgraph Storage ["Persistence Layer (SQLite)"]
        T_Inc[("incidents Table")]
        T_Unit[("response_units Table")]
        T_Log[("incident_events (Append-only)")]
    end

    UI_Dash --> R_Dash
    UI_Inc --> R_Inc
    UI_Det --> R_Inc
    UI_Rep --> R_Inc
    UI_Unit --> R_Unit
    UI_Model --> R_Sys

    R_Inc --> FSM
    FSM --> T_Inc
    FSM --> T_Unit
    FSM --> T_Log
    R_Unit --> T_Unit
    R_Dash --> T_Inc
    R_Dash --> T_Unit
    R_Dash --> T_Log
```

---

## 2. Use Case Model

```mermaid
flowchart LR
    Reporter(["Emergency Reporter"])
    Coordinator(["Emergency Coordinator"])
    Unit(["Response Unit"])

    UC1["Report Emergency Incident"]
    UC2["Inspect Incident Dashboard"]
    UC3["Verify Incident Authenticity"]
    UC4["Dispatch Available Response Unit"]
    UC5["Start On-Scene Response"]
    UC6["Resolve & Close Incident"]
    UC7["Inspect Audit Trail & Timeline"]
    UC8["Test State Invariants"]

    Reporter --> UC1
    Coordinator --> UC2
    Coordinator --> UC3
    Coordinator --> UC4
    Coordinator --> UC6
    Coordinator --> UC7
    Coordinator --> UC8
    Unit --> UC5
    Unit --> UC7
```

---

## 3. Sequence Model (Core Interaction Workflow)

This Sequence Diagram documents the exact interactions between all three actors and the ERCS core engine as implemented.

```mermaid
sequenceDiagram
    autonumber
    actor Reporter as Emergency Reporter
    participant System as ERCS Core System
    actor Coordinator as Emergency Coordinator
    actor Unit as Response Unit

    %% Step 1: Reporting
    Note over Reporter, System: 1. Incident Ingestion
    Reporter->>System: POST /api/incidents (type, location, priority, description)
    System->>System: Validate required fields & assign ID (ER-XXX)
    System->>System: Set status = REPORTED
    System->>System: Append event to incident_events
    System-->>Reporter: 201 Created (Incident Registered)

    %% Step 2: Verification
    Note over Coordinator, System: 2. Authenticity Verification
    Coordinator->>System: GET /api/incidents (Review queue)
    System-->>Coordinator: List of REPORTED incidents
    Coordinator->>System: POST /api/incidents/{id}/verify (notes)
    System->>System: validate_transition(REPORTED -> VERIFIED)
    System->>System: Set status = VERIFIED, log event
    System-->>Coordinator: 200 OK (Incident Verified)

    %% Step 3: Dispatch
    Note over Coordinator, System: 3. Fleet Allocation & Dispatch
    Coordinator->>System: GET /api/response-units?status=AVAILABLE
    System-->>Coordinator: List of AVAILABLE units
    Coordinator->>System: POST /api/incidents/{id}/dispatch (unit_id)
    System->>System: validate_transition(VERIFIED -> DISPATCHED)
    System->>System: Check unit.status == AVAILABLE
    System->>System: Set unit.status = ASSIGNED, incident.status = DISPATCHED
    System->>System: Append dispatch event
    System-->>Coordinator: 200 OK (Unit Dispatched)

    %% Step 4: Response Commencement
    Note over Unit, System: 4. On-Scene Emergency Response
    Unit->>System: POST /api/incidents/{id}/respond (notes)
    System->>System: validate_transition(DISPATCHED -> RESPONDING)
    System->>System: Set unit.status = BUSY, incident.status = RESPONDING
    System->>System: Append responding event
    System-->>Unit: 200 OK (Response Active)

    %% Step 5: Incident Resolution
    Note over Coordinator, System: 5. Mitigation & Closure
    Coordinator->>System: POST /api/incidents/{id}/resolve (resolution_notes)
    System->>System: validate_transition(RESPONDING -> RESOLVED)
    System->>System: Set unit.status = AVAILABLE, current_incident_id = NULL
    System->>System: Set incident.status = RESOLVED (Terminal)
    System->>System: Append resolution audit event
    System-->>Coordinator: 200 OK (Incident Resolved, Unit Released)
```

---

## 4. State Model (Finite State Machine)

The incident progresses strictly through five states. Any deviation triggers an immediate rejection.

```mermaid
stateDiagram-v2
    [*] --> REPORTED : Citizen registers emergency

    REPORTED --> VERIFIED : Coordinator confirms authenticity
    REPORTED --> RESOLVED : ✗ INVALID (Rejected with 400)
    REPORTED --> RESPONDING : ✗ INVALID (Rejected with 400)

    VERIFIED --> DISPATCHED : Available response unit assigned
    VERIFIED --> RESOLVED : ✗ INVALID (Rejected with 400)
    VERIFIED --> RESPONDING : ✗ INVALID (Rejected with 400)

    DISPATCHED --> RESPONDING : Unit arrives on scene (Unit BUSY)
    DISPATCHED --> RESOLVED : ✗ INVALID (Rejected with 400)

    RESPONDING --> RESOLVED : Hazard neutralized (Unit freed to AVAILABLE)

    state RESOLVED {
        [*] --> Terminal
        Terminal : Closed & Archived
    }

    RESOLVED --> [*]
```

### 4.1 Response Unit State Machine

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Initialized in Fleet

    AVAILABLE --> ASSIGNED : Coordinator dispatches to incident
    ASSIGNED --> BUSY : Unit arrives on scene & starts responding
    BUSY --> AVAILABLE : Incident resolved; unit returns to service
    ASSIGNED --> AVAILABLE : (If reassigned / cancelled)
```

---

## 5. Entity Relationship (ER) Model

```mermaid
erDiagram
    incidents ||--o| response_units : "assigned_to"
    incidents ||--|{ incident_events : "generates"

    incidents {
        text id PK "ER-001, ER-002..."
        text emergency_type "Fire, Medical, Accident..."
        text location "Street address / landmark"
        text description "Detailed description"
        text priority "LOW, MEDIUM, HIGH, CRITICAL"
        text status "REPORTED, VERIFIED, DISPATCHED..."
        text reported_by "Reporter name"
        text contact_number "Callback phone"
        text reported_at "ISO-8601 UTC timestamp"
        text last_updated_at "ISO-8601 UTC timestamp"
        text assigned_unit_id FK "References response_units(id)"
        text verification_notes "Coordinator notes"
        text resolution_notes "Closing notes"
    }

    response_units {
        text id PK "RU-FIRE-01, RU-AMB-01..."
        text name "Fire Unit 01, Ambulance 01..."
        text type "Fire, Medical, Police, Rescue"
        text status "AVAILABLE, ASSIGNED, BUSY"
        text current_incident_id "References incidents(id)"
        text station_location "Station base"
    }

    incident_events {
        integer id PK "Auto-incrementing primary key"
        text incident_id FK "References incidents(id)"
        text timestamp "ISO-8601 UTC timestamp"
        text from_state "Previous state or NULL"
        text to_state "New state reached"
        text actor "Reporter, Coordinator, Unit"
        text action "Action description"
        text notes "Audit details"
    }
```

---

## 6. Data Flow Diagram (DFD)

### 6.1 Level 0 (Context Diagram)

```mermaid
flowchart TD
    Reporter["Emergency Reporter"]
    Coordinator["Emergency Coordinator"]
    Unit["Response Unit"]
    System[("0.0 Emergency Response Coordination System (ERCS)")]

    Reporter -->|Emergency Details| System
    System -->|Incident Reference ID| Reporter

    Coordinator -->|Verification & Dispatch Directives| System
    System -->|Incident Details & Fleet Status| Coordinator

    Unit -->|Response Status Updates| System
    System -->|Dispatch Alerts & Instructions| Unit
```

### 6.2 Level 1 (Decomposition)

```mermaid
flowchart TD
    Reporter["Emergency Reporter"]
    Coordinator["Emergency Coordinator"]
    Unit["Response Unit"]

    P1["1.0 Incident Ingestion"]
    P2["2.0 Verification & Classification"]
    P3["3.0 Fleet Allocation & Dispatch"]
    P4["4.0 Response Tracking"]
    P5["5.0 Incident Resolution & Reclamation"]

    D_Inc[("D1: incidents")]
    D_Unit[("D2: response_units")]
    D_Log[("D3: incident_events")]

    Reporter -->|New Incident Form| P1
    P1 -->|Insert Record| D_Inc
    P1 -->|Log Event| D_Log

    Coordinator -->|Verify Action| P2
    P2 -->|Update to VERIFIED| D_Inc
    P2 -->|Log Event| D_Log

    Coordinator -->|Dispatch Order| P3
    P3 -->|Query Available| D_Unit
    P3 -->|Assign Unit| D_Unit
    P3 -->|Update to DISPATCHED| D_Inc
    P3 -->|Log Event| D_Log

    Unit -->|Arrive on Scene| P4
    P4 -->|Unit to BUSY| D_Unit
    P4 -->|Update to RESPONDING| D_Inc
    P4 -->|Log Event| D_Log

    Coordinator -->|Close Incident| P5
    P5 -->|Update to RESOLVED| D_Inc
    P5 -->|Release to AVAILABLE| D_Unit
    P5 -->|Log Event| D_Log
```
