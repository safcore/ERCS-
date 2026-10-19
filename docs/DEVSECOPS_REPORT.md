# Comprehensive DevSecOps Project Report
# Emergency Response Coordination System (ERCS)

**Academic Course:** DevSecOps Lab — CIAP Microproject  
**Academic Degree:** Bachelor of Technology in Computer Science & Engineering  
**Student Roll No:** 124BTCS1031  
**Project Title:** Sequence and State Modelling of an Emergency Response Coordination System with DevSecOps CI/CD Automation  
**United Nations Sustainable Development Goal:** SDG 9 – Industry, Innovation and Infrastructure (Target 9.1 & Target 9.b)  
**Submission Date:** October 2026  

---

## 1. Title Page & Student Identification

* **Project Name:** Emergency Response Coordination System (ERCS)
* **Student Identifier:** Roll No. 124BTCS1031
* **Course:** DevSecOps Lab (Continuous Integration, Automation & Protection)
* **Repository:** `https://github.com/safcore/ERCS-.git`
* **Technology Stack:** React 19, Vite 8, Python 3.12/3.14, Flask 3.1, SQLite 3, Gunicorn, Nginx Alpine, Docker Engine, Jenkins LTS, Terraform v1.9.8, SonarQube 9.9.8 LTS, Trivy Container Scanner, AWS ECR/EC2.

---

## 2. Executive Summary & Academic Objectives

The **Emergency Response Coordination System (ERCS)** is an integrated software engineering and DevSecOps microproject. The core functional objective is to demonstrate formal **Sequence Modelling** (chronological interactions between Citizen Reporters, Coordinators, and Response Units) and **State Modelling** (strict Finite State Machine progression: `REPORTED` $\rightarrow$ `VERIFIED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RESPONDING` $\rightarrow$ `RESOLVED`).

The DevSecOps objective is to wrap this mission-critical emergency system in an automated, secure software delivery pipeline:
1. **Containerization:** Decoupled multi-stage Docker builds with Nginx reverse proxying and persistent SQLite volumes. Verified running and healthy.
2. **CI/CD Automation:** A declarative 8-stage Jenkins pipeline executing automated test verification, security scanning, container registry publishing, and cloud deployment. Jenkins active on port 8080.
3. **Infrastructure as Code:** Modular HashiCorp Terraform declarations targeting AWS Free Tier resources with encrypted storage, least-privilege IAM roles, and Amazon ECR repositories. Validated via `terraform init` and `terraform validate`.
4. **Shift-Left Security:** Automated Static Application Security Testing (SonarQube) achieving Quality Gate PASSED with 0 bugs/vulnerabilities, and Container Vulnerability Scanning (Trivy) achieving 0 High/Critical CVEs on the frontend container.
5. **Agile Governance:** Scrum-based backlog planning and sprint execution tracked in Jira.

---

## 3. Problem Definition, Scope & SDG 9 Alignment

### 3.1 Problem Statement
Urban emergency dispatch systems frequently face workflow breakdown:
* **Illegal State Skips:** Incidents marked closed without on-scene verification or unit dispatch.
* **Resource Contention:** Dispatching units that are already occupied with existing emergencies.
* **Audit Failure:** Inability to reconstruct the exact chronological sequence of decisions during post-incident investigations.
* **Vulnerable Delivery:** Traditional manual deployments risk credential leakage, unpatched dependencies, and unverified builds.

### 3.2 SDG 9 Alignment (Industry, Innovation and Infrastructure)
UN SDG 9 aims to build resilient infrastructure, promote inclusive and sustainable industrialization, and foster innovation. ERCS directly supports this goal through two specific targets:
* **Target 9.1 (Develop quality, reliable, sustainable, and resilient infrastructure):** ERCS delivers a resilient, fault-tolerant digital emergency management infrastructure. By enforcing server-side state transitions (`REPORTED` $\rightarrow$ `VERIFIED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RESPONDING` $\rightarrow$ `RESOLVED`), the system ensures continuous operational reliability and eliminates workflow failures during critical civic emergencies.
* **Target 9.b (Support domestic technology development, research, and innovation):** The project embeds modern DevSecOps innovation into public infrastructure software by automating shift-left vulnerability testing, containerized micro-service isolation, and declarative infrastructure-as-code deployment pipelines.

---

## 4. System Architecture & Data Flow

ERCS employs a decoupled, multi-tier containerized client-server architecture:
* **Presentation Tier:** Single Page Application (SPA) built with React 19 and styled with custom command-center CSS. Served in production via an Nginx 1.27 Alpine container on port 80 (mapped to host port 3000).
* **API & Business Logic Tier:** RESTful JSON API implemented in Python/Flask 3.1, hosted under a Gunicorn WSGI server on port 5000.
* **State Engine:** Finite State Machine in `models.py` validating every state transition predicate server-side before persisting changes.
* **Data Persistence Tier:** SQLite 3 database operating with `PRAGMA foreign_keys = ON;`, auto-migrated on startup and isolated to a named Docker volume (`ercs_sqlite_data`).

---

## 5. DevSecOps Lifecycle & Methodology

The project adheres to the standard DevSecOps continuous lifecycle:
1. **Plan:** Agile user stories, acceptance criteria, and sprint backlogs in Jira.
2. **Code:** Modular, parameterized code adhering to clean architecture.
3. **Build:** Multi-stage container builds minimizing attack surfaces.
4. **Test:** Automated pytest suite executing 14 rigorous state machine test cases (100% pass rate).
5. **Secure (SAST & SCA):** SonarQube code quality rules (Quality Gate PASSED) and Trivy vulnerability checks.
6. **Release & Deploy:** Immutable Docker image tagging, Amazon ECR repositories, and Terraform AWS IaC provisioning.
7. **Operate & Monitor:** Container healthcheck endpoints (`/api/system/health`) and structured logging.

---

## 6. Git & GitHub Version Control Management

* **Repository Structure:**
  * Clean mono-repository separating `frontend/`, `backend/`, `tests/`, `docs/`, and `terraform/`.
* **Branching Strategy:** Mainline tracking on branch `main`.
* **Ignore Enforcement:** Comprehensive root `.gitignore` guarantees zero check-ins of virtual environments (`venv/`), dependencies (`node_modules/`), local databases (`ercs.db`), bytecode caches (`__pycache__/`), or Terraform state files (`*.tfstate`).
* **Remote:** Hosted at `https://github.com/safcore/ERCS-.git`.

---

## 7. Containerization Strategy (Docker & Docker Compose)

> **Implementation & Verification Status:** **FULLY EXECUTED & OPERATIONAL**  
> *Dockerfiles, Compose orchestration, and containers are compiled and running live under Docker Engine 26.1. Both `ercs-backend` and `ercs-frontend` containers are verified healthy with persistent volume mounts.*

### 7.1 Backend Containerization (`backend/Dockerfile`)
* Base Image: `python:3.12-slim`
* Security Practice: Runs as non-root user `appuser` (UID `1001`).
* Entrypoint: Gunicorn WSGI server (`gunicorn --bind 0.0.0.0:5000 --workers 2 app:create_app()`).
* Storage: SQLite database directed to `/app/data/ercs.db` via `DATABASE_PATH`.
* Status: Active and healthy on `http://localhost:5000/api/system/health`.

### 7.2 Frontend Containerization (`frontend/Dockerfile`)
* Build Stage: `node:20-alpine` compiling static assets via `npm run build`.
* Runtime Stage: `nginx:1.27-alpine-slim` serving static bundle from `/usr/share/nginx/html`.
* Reverse Proxy: `nginx.conf` proxies `/api` to `http://backend:5000`, eliminating CORS issues in production.
* Status: Active and healthy on `http://localhost:3000`.

### 7.3 Multi-Container Orchestration (`docker-compose.yml`)
* Orchestrates `backend` and `frontend` services over an isolated bridge network (`ercs-net`).
* Mounts persistent named volume `ercs_sqlite_data` to `/app/data`.
* Configures automatic healthcheck retries on both services.

---

## 8. Continuous Integration & Continuous Delivery (Jenkins)

> **Implementation & Verification Status:** **CODIFIED, AGENT RUNNING & VERIFIED**  
> *The 8-stage declarative pipeline is codified in `Jenkinsfile`. Jenkins LTS automation controller is running on port 8080 (`http://localhost:8080`). Backend tests (14/14 passed) and Frontend build (Vite 422ms) are verified.*

The pipeline is codified in [`Jenkinsfile`](../Jenkinsfile) utilizing declarative syntax across 8 automated stages:
* **Stage 1 (Checkout SCM):** Pulls commit from GitHub `main`.
* **Stage 2 (Backend Tests):** Installs Python virtual environment and executes 14 pytest tests (`100% pass, verified`).
* **Stage 3 (Frontend Build):** Runs `npm ci && npm run build` to verify clean production compilation (`verified in ~422ms`).
* **Stage 4 (SonarQube SAST):** Executes SonarQube Scanner against active SonarQube server (`Quality Gate: PASSED`).
* **Stage 5 (Trivy Scan):** Scans filesystem and container images for High/Critical CVEs (`Reports saved to docs/`).
* **Stage 6 (Docker Multi-Build):** Builds and tags container images for both frontend and backend.
* **Stage 7 (Push to Registry / ECR):** Authenticates and tags container images for Amazon ECR.
* **Stage 8 (Deployment):** Deploys containers to AWS EC2 host via Docker Compose.

---

## 9. Infrastructure as Code (Terraform & AWS Cloud)

> **Implementation & Verification Status:** **VALIDATED & INITIALIZED (Cloud Apply Requires User AWS Credentials)**  
> *Terraform HCL manifests are authored with provider pinning, encrypted EBS, least-privilege security groups, and Amazon ECR repositories. `terraform init` and `terraform validate` both PASSED successfully.*

### 9.1 Infrastructure Design (`terraform/`)
* **VPC & Networking:** Dedicated VPC (`10.0.0.0/16`), public subnet (`10.0.1.0/24`), Internet Gateway, and Route Table.
* **Security Group:** Ingress restricted to ports 80 (HTTP), 3000 (Frontend), and 5000 (API). Direct SSH port 22 is disabled by default (`allowed_ssh_cidrs = []`), employing dynamic ingress only when an administrator provides a restricted `/32` IP, and relying on AWS Systems Manager (SSM) for zero-trust shell access.
* **IAM Role:** Least-privilege role attaching `AmazonSSMManagedInstanceCore` and `AmazonEC2ContainerRegistryReadOnly`.
* **Compute Instance:** AWS Free Tier eligible `t2.micro` running Ubuntu 22.04 LTS with an encrypted 20 GB gp3 root EBS volume.
* **ECR Repositories:** Automated container repositories `ercs-backend` and `ercs-frontend` with scan-on-push enabled.
* **Automated Bootstrap:** `user_data` script installs Docker Engine, clones the GitHub repository, and launches containers via Docker Compose automatically.

---

## 10. Security Analysis & Vulnerability Management

> **Implementation & Verification Status:** **VERIFIED: SCA, SAST & CONTAINER SCANS EXECUTED**  
> *Real scans executed and documented in `docs/SONARQUBE_REPORT.md` and `docs/VULNERABILITY_REPORT.md`.*

### 10.1 Software Composition Analysis (SCA)
* **Frontend:** `npm audit` returned **0 vulnerabilities** across all 26 packages.
* **Backend:** Python dependencies pinned to secure releases with patches against CVE-2024-37891 (`urllib3>=2.8.0`) and CVE-2024-6345 (`setuptools>=78.1.1`).

### 10.2 Static Application Security Testing (SAST) — SonarQube
* Executed SonarQube 9.9.8 LTS Community and `sonarsource/sonar-scanner-cli` against 4,766 lines of code.
* Quality Gate: **PASSED (OK)**.
* Reliability Rating: **1.0 (A)** with **0 Bugs** (1 detected bug in `StateProgressStepper.jsx` was remediated and confirmed `CLOSED FIXED`).
* Security Rating: **1.0 (A)** with **0 Vulnerabilities**.
* Maintainability Rating: **1.0 (A)** with **0.0% Duplication**.
* 4 Security Hotspots reviewed and marked safe.

### 10.3 Trivy Container Security
* Executed official containerized Trivy scanner (`aquasec/trivy:latest`) against backend and frontend container images.
* Frontend image (`ercs-frontend:1.0.1`): **0 High / 0 Critical CVEs**.
* Reports saved to `docs/trivy-backend-report.txt` and `docs/trivy-frontend-report.txt`.

---

## 11. Agile Project Management (Jira)

* **Project Structure:** Managed under Project Key `ERCS` across 4 Epics (Core Engine, Containerization, CI/CD Automation, Cloud & Security).
* **Sprint Execution:**
  * **Sprint 1 (Days 1–5):** FSM Invariant Engine, SQLite Schema, React Command Dashboard, Pytest Suite.
  * **Sprint 2 (Days 6–9):** Dockerfiles, Nginx Reverse Proxy, Docker Compose, Declarative Jenkinsfile.
  * **Sprint 3 (Days 10–14):** SonarQube SAST execution, Trivy container scans, Terraform AWS scripts, Academic Report.

---

## 12. Challenges Encountered & Technical Mitigations

1. **Challenge:** SQLite Database Locked / Overwritten in Docker.  
   *Mitigation:* Configured `DATABASE_PATH` environment variable support and mounted a persistent named volume to `/app/data`, isolating database state from container lifecycles.
2. **Challenge:** Browser CORS Blocks in Containerized Production.  
   *Mitigation:* Configured Nginx inside the frontend container as an internal reverse proxy forwarding `/api/` traffic to `http://backend:5000/api/`, ensuring all browser calls remain same-origin.
3. **Challenge:** Alpine Nginx IPv6 Healthcheck Resolution.  
   *Mitigation:* `wget http://localhost:80/` failed because `localhost` resolved to IPv6 `[::1]:80`. Added `listen [::]:80;` in `frontend/nginx.conf` and updated health checks to `http://127.0.0.1:80/`.
4. **Challenge:** Host Device Guard / Policy Blocking Windows Scanner Binaries.  
   *Mitigation:* Leveraged containerized execution for Trivy (`aquasec/trivy`) and SonarQube Scanner (`sonarsource/sonar-scanner-cli`) mounted to the repository.

---

## 13. Conclusion & Project Reflection

The ERCS DevSecOps Lab CIAP Microproject demonstrates how classical software engineering principles (state modelling and sequence tracking) can be united with modern DevSecOps practices. By embedding security gates, container isolation, automated testing, and infrastructure-as-code into every stage of development, the project guarantees both operational reliability and software protection for urban emergency response coordination.

### Student Personal Reflection Draft *(Roll No. 124BTCS1031)*:
> *"Working on this DevSecOps CIAP project provided me with practical, hands-on experience in bridging the gap between functional application development and operational security automation. Implementing the 5-stage Finite State Machine taught me how backend logic must enforce critical invariants rather than relying on frontend UI guards. Creating the multi-stage Dockerfiles and Nginx reverse proxy clarified how modern container networking handles same-origin routing and non-root execution. Codifying the 8-stage Jenkins pipeline, running local SonarQube SAST and Trivy scans, and authoring Terraform AWS architecture showed me how infrastructure and security testing can be treated as reliable, version-controlled code. Overall, this project deepened my understanding of how DevSecOps principles enhance software quality and public safety in accordance with SDG 9."*
