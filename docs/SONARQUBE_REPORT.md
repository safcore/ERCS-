# SonarQube Static Application Security Testing (SAST) Report

**Project:** Emergency Response Coordination System (ERCS)  
**Course:** Software Engineering Practices (SEP) / DevSecOps Lab CIAP Microproject  
**Student Roll No:** `124BTCS1031`  
**Execution Date:** 15 October 2026  
**SonarQube Version:** 9.9.8 LTS Community Edition  
**Sonar Scanner:** `sonarsource/sonar-scanner-cli` (v5+)  
**Project Key:** `ERCS-DevSecOps`  

---

## 1. Executive Summary

A comprehensive Static Application Security Testing (SAST) scan was conducted against the Emergency Response Coordination System (ERCS) source code repository, covering both the Python/Flask backend and React 19/Vite frontend.

The SonarQube analysis completed with **Quality Gate Status: PASSED (OK)** across all dimensions.

### Summary Metrics Dashboard

| Metric Category | Initial Scan | Remediated Scan | Target Threshold | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Quality Gate** | **OK (Passed)** | **OK (Passed)** | Passed | **PASSED** |
| **Security Rating** | **1.0 (A)** | **1.0 (A)** | A | **PASSED** |
| **Vulnerabilities** | **0** | **0** | 0 | **PASSED** |
| **Reliability Rating** | 3.0 (C) | **1.0 (A)** | A | **PASSED** |
| **Bugs** | 1 | **0** | 0 | **RESOLVED & VERIFIED** |
| **Maintainability Rating** | **1.0 (A)** | **1.0 (A)** | A | **PASSED** |
| **Code Smells** | 33 | **32** | < 50 | **ACCEPTABLE** |
| **Security Hotspots** | 4 | **4** | Reviewed | **REVIEWED** |
| **Duplicated Lines Density** | **0.0%** | **0.0%** | < 3.0% | **PASSED** |
| **Lines of Code (NCLOC)** | 4,768 | **4,766** | N/A | **N/A** |

---

## 2. Issues Discovered and Remediated

### 2.1 Bug Analysis & Resolution (Rule: `javascript:S3923`)

* **Issue Key:** `AaE-2p50DJq4kI9hgkXz`
* **Rule ID:** `javascript:S3923` ("All branches in a conditional structure should not have exactly the same implementation")
* **Severity:** MAJOR
* **Component:** `frontend/src/components/StateProgressStepper.jsx`
* **Initial State:** OPEN

#### Root Cause:
In `StateProgressStepper.jsx` (lines 34–38), a nested ternary conditional checked `isCurrent ? <span>{index + 1}</span> : <span>{index + 1}</span>`, returning identical JSX expressions on both the true and false branches:
```javascript
// BEFORE REMEDIATION (Redundant ternary condition)
{isCompleted ? (
  <Check size={18} strokeWidth={2.5} />
) : isCurrent ? (
  <span>{index + 1}</span>
) : (
  <span>{index + 1}</span>
)}
```

#### Remediation Applied:
The redundant ternary expression was simplified to evaluate the pending/current fallback directly:
```javascript
// AFTER REMEDIATION (Clean, deterministic branch)
{isCompleted ? (
  <Check size={18} strokeWidth={2.5} />
) : (
  <span>{index + 1}</span>
)}
```

#### Verification:
Following automated rescanning with `sonarsource/sonar-scanner-cli`, SonarQube verified the remediation:
* **Status:** `CLOSED`
* **Resolution:** `FIXED`
* **Current Active Bugs:** `0`
* **Updated Reliability Rating:** `1.0 (A)`

---

## 3. Security Hotspots Review

SonarQube highlighted 4 security hotspots requiring manual code and architecture review:

| Hotspot Key | File & Line | Message | Probability | Review Verdict & Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `AaE-2p6HDJq4kI9hgkX3` | `backend/app.py:20` | *Make sure disabling CSRF protection is safe here.* | HIGH | **Reviewed & Safe:** ERCS is a stateless REST API consumed via JSON tokens and browser SPA headers. CSRF protection is irrelevant for Bearer-token and CORS-delimited RESTful API interactions. |
| `AaE-2p6XDJq4kI9hgkX7` | `backend/Dockerfile:27` | *Make sure that recursively copying directories is safe here.* | MEDIUM | **Reviewed & Safe:** `.dockerignore` strictly excludes virtual environments, SQLite databases, and sensitive local configuration prior to `COPY . .`. |
| `AaE-2p5-DJq4kI9hgkX2` | `frontend/src/App.jsx:22` | *Make sure that using this pseudorandom number generator is safe here.* | MEDIUM | **Reviewed & Safe:** `Math.random()` is only used for generating non-security client-side UI animation keys. All authoritative incident UUIDs and database IDs are generated server-side. |
| `AaE-2p6HDJq4kI9hgkX4` | `backend/app.py:27` | *Make sure this permissive CORS policy is safe here.* | LOW | **Reviewed & Configured:** CORS is configured to facilitate communication between the React SPA frontend container (port 3000) and the backend API container (port 5000). |

---

## 4. Quality Gate Status

The SonarQube Quality Gate evaluated all core metrics and awarded the project an **OK / PASSED** rating:
* 0 Blockers
* 0 Criticals
* 0 Bugs (Reliability Rating: A)
* 0 Vulnerabilities (Security Rating: A)
* Maintainability Rating: A
* Duplication: 0.0%
