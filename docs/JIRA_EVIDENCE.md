# Agile Project Management & Jira Backlog Evidence
## Emergency Response Coordination System (ERCS)

**Academic Course:** DevSecOps Lab — CIAP Microproject  
**Student Roll No:** 124BTCS1031  
**Project:** Sequence and State Modelling of an Emergency Response Coordination System  
**Methodology:** Agile Scrum with Sprint Iterations  

---

## 1. Project Management Overview

The ERCS DevSecOps project was organized into three distinct Scrum sprints balancing functional software engineering, automated pipeline integration, containerization, and security scanning:

```
+---------------------------------------------------------------------------------------+
| SPRINT 1: Core Engine & FSM Modeling                                                  |
| Focus: Python/Flask API, React 19 Frontend, SQLite, Strict 5-Stage State Machine      |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
| SPRINT 2: Containerization & CI/CD Pipeline Automation                                |
| Focus: Multi-stage Dockerfiles, Docker Compose, Declarative Jenkinsfile               |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
| SPRINT 3: DevSecOps Security, Infrastructure as Code & Academic Submission             |
| Focus: SonarQube SAST, Trivy Scanning, Terraform AWS, Documentation & Viva Prep      |
+---------------------------------------------------------------------------------------+
```

---

## 2. DevSecOps Epics & User Story Backlog

*Note: The following user stories, acceptance criteria, and task breakdowns represent the genuine implementation roadmap of the ERCS microproject.*

### Epic 1: Core Incident Lifecycle & State Machine (ERCS-EPIC-01)
* **User Story 1.1 (Incident Intake):**  
  *As an Emergency Reporter, I want to submit an incident with type, location, and priority, so that the coordination center registers it in state `REPORTED`.*  
  *Acceptance Criteria:* Auto-generate `ER-XXX` ID, validate required fields, append creation audit event. (*Status: Completed in code*)
* **User Story 1.2 (Incident Verification):**  
  *As an Emergency Coordinator, I want to verify reported incidents, so that valid emergencies advance to `VERIFIED`.*  
  *Acceptance Criteria:* Invariant validator rejects non-REPORTED incidents; records verification notes. (*Status: Completed in code*)
* **User Story 1.3 (Fleet Allocation & Dispatch):**  
  *As an Emergency Coordinator, I want to assign available units, so that the incident moves to `DISPATCHED` and the unit is marked `ASSIGNED`.*  
  *Acceptance Criteria:* Rejects already `ASSIGNED` or `BUSY` units with HTTP 400. (*Status: Completed in code*)
* **User Story 1.4 (Response Start & Mitigation):**  
  *As a Response Unit, I want to signal on-scene arrival, so that the incident status changes to `RESPONDING` and unit status to `BUSY`.*  
  *Acceptance Criteria:* Transitions incident to `RESPONDING`, unit to `BUSY`. (*Status: Completed in code*)
* **User Story 1.5 (Resolution & Unit Reclamation):**  
  *As a Coordinator, I want to resolve the incident, so that it reaches terminal state `RESOLVED` and the response unit is returned to `AVAILABLE`.*  
  *Acceptance Criteria:* Releases unit to `AVAILABLE`, marks state `RESOLVED`, locks further transitions. (*Status: Completed in code*)

### Epic 2: Containerization & Orchestration (ERCS-EPIC-02)
* **User Story 2.1 (Backend Dockerization):**  
  *As a DevOps Engineer, I want a containerized Flask backend running Gunicorn as a non-root user, so that the API runs securely in any environment.*  
  *Acceptance Criteria:* Multi-stage or slim image, non-root `appuser`, healthcheck on `/api/system/health`. (*Status: Completed in `backend/Dockerfile`*)
* **User Story 2.2 (Frontend Dockerization):**  
  *As a DevOps Engineer, I want a multi-stage Nginx container serving compiled Vite assets, so that the UI is served efficiently with reverse proxying.*  
  *Acceptance Criteria:* Multi-stage build (`node:20-alpine` $\rightarrow$ `nginx:alpine-slim`), reverse proxy `/api/` to `backend:5000`. (*Status: Completed in `frontend/Dockerfile` & `nginx.conf`*)
* **User Story 2.3 (Multi-Container Compose):**  
  *As a Developer, I want to launch the full system with a single `docker compose up` command, so that all services connect over an isolated bridge network.*  
  *Acceptance Criteria:* Services `frontend` and `backend` configured with health checks and persistent volume `ercs_sqlite_data`. (*Status: Completed in `docker-compose.yml`*)

### Epic 3: CI/CD Pipeline & Static Analysis (ERCS-EPIC-03)
* **User Story 3.1 (Declarative Jenkins Pipeline):**  
  *As a Release Engineer, I want a Jenkinsfile automating checkout, build, testing, and deployment, so that every commit is validated automatically.*  
  *Acceptance Criteria:* Complete 7-stage pipeline with conditional execution for external tools. (*Status: Completed in `Jenkinsfile`*)
* **User Story 3.2 (Automated Test Execution):**  
  *As a QA Engineer, I want automated pytest execution in the pipeline, so that breaking changes are caught immediately.*  
  *Acceptance Criteria:* All 14 tests in `tests/test_ercs.py` executed with JUnit XML reporting. (*Status: Completed in pipeline*)
* **User Story 3.3 (Static Code Analysis):**  
  *As a Security Engineer, I want SonarQube static analysis configured, so that code smells and security hotspots are monitored.*  
  *Acceptance Criteria:* Project properties file configured with source paths and exclusions. (*Status: Completed in `sonar-project.properties`*)

### Epic 4: Infrastructure as Code & Cloud Readiness (ERCS-EPIC-04)
* **User Story 4.1 (Terraform AWS Provisioning):**  
  *As a Cloud Engineer, I want Terraform scripts defining AWS VPC, Subnet, Security Groups, and EC2 instance, so that infrastructure is repeatable.*  
  *Acceptance Criteria:* Parameterized variables, encrypted root volume, automated Docker user_data bootstrap, zero hardcoded secrets. (*Status: Completed in `terraform/`*)

---

## 3. Sprint Planning & Task Execution Matrix

| Sprint | Task Description | Planned Story Points | Assigned Role | Verification Artifact | Status |
|---|---|---|---|---|---|
| **Sprint 1** | Implement Finite State Machine Invariant Engine | 5 | Lead Backend Developer | [`backend/models.py`](../backend/models.py) | **Done** |
| **Sprint 1** | Build SQLite Schema with Auto-Migration & Seed Data | 3 | Database Engineer | [`backend/database.py`](../backend/database.py) | **Done** |
| **Sprint 1** | Develop React Command Dashboard & FSM Stepper | 8 | Full-Stack UI Designer | [`frontend/src/`](../frontend/src/) | **Done** |
| **Sprint 1** | Implement 14 Automated Pytest State Tests | 5 | QA / Test Engineer | [`tests/test_ercs.py`](../tests/test_ercs.py) | **Done** (14/14 Passed) |
| **Sprint 2** | Construct Non-Root Backend Dockerfile | 3 | DevOps Engineer | [`backend/Dockerfile`](../backend/Dockerfile) | **Done** |
| **Sprint 2** | Build Multi-Stage Nginx Frontend Dockerfile | 3 | DevOps Engineer | [`frontend/Dockerfile`](../frontend/Dockerfile) | **Done** |
| **Sprint 2** | Compose Multi-Service Architecture with Volume | 5 | DevOps Engineer | [`docker-compose.yml`](../docker-compose.yml) | **Done** |
| **Sprint 2** | Author Declarative 7-Stage Jenkinsfile | 8 | CI/CD Engineer | [`Jenkinsfile`](../Jenkinsfile) | **Done** |
| **Sprint 3** | Define SonarQube Scanner Properties | 2 | Security Engineer | [`sonar-project.properties`](../sonar-project.properties) | **Done** |
| **Sprint 3** | Execute npm Dependency Security Audit | 2 | Security Engineer | [`docs/VULNERABILITY_REPORT.md`](./VULNERABILITY_REPORT.md) | **Done** (0 Vulns) |
| **Sprint 3** | Write Modular AWS Terraform Configurations | 8 | Cloud Infrastructure Engineer | [`terraform/`](../terraform/) | **Done** |
| **Sprint 3** | Compile Academic Report & Viva Defense Guide | 5 | Documentation Assistant | [`docs/DEVSECOPS_REPORT.md`](./DEVSECOPS_REPORT.md) | **Done** |

---

## 4. Jira Board Setup Instructions (For Student)

To link this backlog directly into your Atlassian Jira Cloud workspace for viva presentation:
1. Navigate to **jira.atlassian.com** and create a free project using the **Scrum** template.
2. Set Project Name to `Emergency Response Coordination System` (Key: `ERCS`).
3. Import or copy the user stories defined above under **Backlog**.
4. Create **Sprint 1**, **Sprint 2**, and **Sprint 3** matching the matrix above.
5. Move completed items to the **Done** column on your active board.
6. Take screenshots of your **Active Board** and **Sprint Burndown Chart** and save them in `docs/evidence/` for your presentation slide deck.
