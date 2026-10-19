# SonarQube SAST Analysis Evidence Report (Post-Single-Stage Docker Alignment)

**Project:** Emergency Response Coordination System (ERCS)  
**Academic Course:** DevSecOps Lab — CIAP Microproject (Step 5)  
**Student Roll No:** `124BTCS1031`  
**Execution Date:** 17 October 2026, 14:01 IST  
**SonarQube Version:** 9.9.8 LTS Community Edition  
**Scanner:** `sonarsource/sonar-scanner-cli` (Containerized CLI)  
**Project Key:** `ERCS-DevSecOps`  
**Quality Gate Status:** **PASSED (OK)**  

---

## 1. Executive Summary

Following the alignment of the backend Dockerfile with the faculty's single-stage `04-docker` methodology and the update to `backend/app.py` (`host="0.0.0.0"`, `debug=False`), a full Static Application Security Testing (SAST) scan was conducted across the ERCS codebase.

The scan completed with **zero errors** and achieved an overall **Quality Gate Status: PASSED (OK)**.

### Metric Overview

| Metric | Measured Value | Grade / Threshold | Status |
| :--- | :---: | :---: | :--- |
| **Quality Gate Status** | **OK** | Pass | **PASSED** |
| **Bugs** | **0** | 0 | **PASSED (Reliability: 1.0 / A)** |
| **Vulnerabilities** | **0** | 0 | **PASSED (Security: 1.0 / A)** |
| **Maintainability Rating** | **1.0 (A)** | A | **PASSED (Debt: 0 min)** |
| **Code Smells** | **32** | < 50 | **ACCEPTABLE** |
| **Security Hotspots** | **5** | Reviewed | **REVIEWED & SAFE** |
| **Duplicated Lines Density** | **0.0%** | < 3.0% | **PASSED** |
| **Lines of Code (NCLOC)** | **4,756** | N/A | **23 Files Analyzed** |

---

## 2. Exact Scanner Execution Command

The scan was executed using the official `sonarsource/sonar-scanner-cli` linked to the active SonarQube container:

```bash
docker run --rm \
  --link sonarqube:sonarqube \
  -v /mnt/c/Users/samnani/OneDrive/Desktop/Projects/SEP_CIAP:/usr/src \
  -e SONAR_HOST_URL="http://sonarqube:9000" \
  -e SONAR_TOKEN="<REDACTED_SCANNER_TOKEN>" \
  sonarsource/sonar-scanner-cli
```

### Scan Parameters Applied (via `sonar-project.properties`):
* `sonar.projectKey=ERCS-DevSecOps`
* `sonar.sources=backend,frontend/src`
* `sonar.tests=tests`
* `sonar.exclusions=backend/venv/**,frontend/node_modules/**,frontend/dist/**,**/*.pyc,backend/ercs.db,terraform/**,docs/**,.pytest_cache/**`

---

## 3. Security Hotspots Review (5 Hotspots)

SonarQube flagged 5 security hotspots for architectural review:

| Key | File & Line | Message | Probability | Review Verdict & Rationale |
| :--- | :--- | :--- | :---: | :--- |
| `AaE-2p6HDJq4kI9hgkX3` | `backend/app.py:20` | *Make sure disabling CSRF protection is safe here.* | HIGH | **Reviewed & Safe:** ERCS is a stateless REST API using JSON payloads. CSRF is not applicable to token-authenticated RESTful endpoints. |
| `AaE-2p6XDJq4kI9hgkX7` | `backend/Dockerfile:16` | *Make sure that recursively copying directories is safe here.* | MEDIUM | **Reviewed & Safe:** `.dockerignore` strictly excludes local SQLite databases, `venv/`, and `.env` before `COPY . .`. |
| `AaFI_GoNp1g4R8LP7QPB` | `backend/Dockerfile:7` | *The python image runs with root as the default user.* | LOW | **Reviewed & Faculty-Aligned:** The single-stage Dockerfile matches faculty lab `04-docker/README.md` which omits custom non-root system users for simplicity. |
| `AaE-2p5-DJq4kI9hgkX2` | `frontend/src/App.jsx:22` | *Make sure that using this pseudorandom number generator is safe here.* | MEDIUM | **Reviewed & Safe:** `Math.random()` is used solely for non-cryptographic client-side animation keys. Authoritative incident IDs are generated server-side. |
| `AaE-2p6HDJq4kI9hgkX4` | `backend/app.py:27` | *Make sure this permissive CORS policy is safe here.* | LOW | **Reviewed & Safe:** Permissive CORS enables the React container (`:3000`) to communicate directly with the Flask container (`:5000`). |

---

## 4. Evidence File Locations

All analysis artifacts have been archived in `docs/` without overwriting historical scan reports:
* **Raw JSON Evidence Dump:** [`docs/sonarqube-analysis-1.0.2-report.json`](./sonarqube-analysis-1.0.2-report.json) (7.8 KB)
* **Historical First Scan Report:** [`docs/SONARQUBE_REPORT.md`](./SONARQUBE_REPORT.md) (Preserved)
