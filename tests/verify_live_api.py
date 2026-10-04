"""
Live Integration and Workflow Verifier
Simulates the entire user browser journey:
1. Open dashboard
2. Report new incident (REPORTED)
3. Attempt invalid transitions (REPORTED -> RESOLVED, REPORTED -> RESPONDING) -> verify 400 rejection
4. Verify incident (REPORTED -> VERIFIED)
5. Dispatch available response unit (VERIFIED -> DISPATCHED)
6. Attempt to assign now-assigned unit to another incident -> verify 400 rejection
7. Start response (DISPATCHED -> RESPONDING)
8. Resolve incident (RESPONDING -> RESOLVED)
9. Verify unit is freed back to AVAILABLE
10. Check append-only event sequence history
11. Confirm dashboard statistics update
"""

import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:5173/api"


def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_content)
        except Exception:
            parsed = {"error": err_content}
        return e.code, parsed


def run_checks():
    print("=" * 60)
    print("STARTING LIVE END-TO-END WORKFLOW VERIFICATION")
    print(f"Targeting frontend proxy: {BASE_URL}")
    print("=" * 60)

    # 1. Dashboard stats
    status, dash1 = make_request("/dashboard/stats")
    assert status == 200, f"Expected 200, got {status}"
    initial_total = dash1["total_incidents"]
    print(f"[OK] 1. Dashboard loaded. Initial total incidents: {initial_total}")

    # 2. Report emergency
    payload = {
        "emergency_type": "Fire",
        "location": "Thane West, Ghodbunder Road",
        "description": "Industrial warehouse chemical smoke emission.",
        "priority": "CRITICAL",
        "reported_by": "Siddharth Rao (Security)",
        "contact_number": "+91 98331 99887",
    }
    status, create_res = make_request("/incidents", method="POST", data=payload)
    assert status == 201, f"Expected 201, got {status}: {create_res}"
    inc = create_res["incident"]
    inc_id = inc["id"]
    assert inc["status"] == "REPORTED"
    print(f"[OK] 2. Incident created with ID: {inc_id}, State: {inc['status']}")

    # 3. Test Invalid Transition (REPORTED -> RESOLVED)
    status, inv_res = make_request(f"/incidents/{inc_id}/resolve", method="POST", data={"resolution_notes": "Illegal"})
    assert status == 400, f"Expected 400, got {status}"
    assert "Invalid state transition" in inv_res.get("error", "")
    print(f"[OK] 3a. Invalid transition REPORTED -> RESOLVED correctly REJECTED (HTTP 400): {inv_res['error']}")

    # 3b. Test Invalid Transition (REPORTED -> RESPONDING)
    status, inv_res2 = make_request(f"/incidents/{inc_id}/respond", method="POST", data={"notes": "Illegal skip"})
    assert status == 400, f"Expected 400, got {status}"
    print(f"[OK] 3b. Invalid transition REPORTED -> RESPONDING correctly REJECTED (HTTP 400): {inv_res2['error']}")

    # 4. Verify Incident
    status, v_res = make_request(f"/incidents/{inc_id}/verify", method="POST", data={"verification_notes": "Confirmed on traffic camera."})
    assert status == 200, f"Expected 200, got {status}"
    assert v_res["current_state"] == "VERIFIED"
    print(f"[OK] 4. Incident {inc_id} successfully transitioned: REPORTED -> VERIFIED")

    # 5. Dispatch available unit
    unit_id = "RU-FIRE-01"
    status, d_res = make_request(f"/incidents/{inc_id}/dispatch", method="POST", data={"unit_id": unit_id, "notes": "Engine dispatched"})
    assert status == 200, f"Expected 200, got {status}"
    assert d_res["current_state"] == "DISPATCHED"
    print(f"[OK] 5. Incident {inc_id} transitioned: VERIFIED -> DISPATCHED with unit {unit_id}")

    # 6. Reject unavailable unit
    status, busy_res = make_request("/incidents/ER-002/dispatch", method="POST", data={"unit_id": unit_id})
    assert status == 400, f"Expected 400, got {status}"
    assert "not AVAILABLE" in busy_res.get("error", "")
    print(f"[OK] 6. Attempt to assign {unit_id} while ASSIGNED correctly REJECTED (HTTP 400): {busy_res['error']}")

    # 7. Start Response
    status, r_res = make_request(f"/incidents/{inc_id}/respond", method="POST", data={"notes": "Engine arrived at warehouse."})
    assert status == 200, f"Expected 200, got {status}"
    assert r_res["current_state"] == "RESPONDING"
    print(f"[OK] 7. Incident {inc_id} transitioned: DISPATCHED -> RESPONDING")

    # 8. Resolve Incident
    status, res_res = make_request(f"/incidents/{inc_id}/resolve", method="POST", data={"resolution_notes": "Chemical hazard neutralized."})
    assert status == 200, f"Expected 200, got {status}"
    assert res_res["current_state"] == "RESOLVED"
    print(f"[OK] 8. Incident {inc_id} transitioned: RESPONDING -> RESOLVED (Terminal)")

    # 9. Verify Unit released back to AVAILABLE
    status, unit_res = make_request(f"/response-units/{unit_id}")
    assert status == 200
    assert unit_res["unit"]["status"] == "AVAILABLE"
    assert unit_res["unit"]["current_incident_id"] is None
    print(f"[OK] 9. Unit {unit_id} verified automatically freed back to AVAILABLE")

    # 10. Audit timeline
    status, ev_res = make_request(f"/incidents/{inc_id}/events")
    assert status == 200
    events = ev_res["events"]
    assert len(events) == 5  # Reported, Verified, Dispatched, Responding, Resolved
    print(f"[OK] 10. Audit timeline verified: {len(events)} sequential events recorded:")
    for ev in events:
        print(f"       [{ev['timestamp'][:19]}] {ev['actor']} => {ev['action']} ({ev['from_state']} -> {ev['to_state']})")

    # 11. Dashboard stats update
    status, dash2 = make_request("/dashboard/stats")
    assert status == 200
    assert dash2["total_incidents"] == initial_total + 1
    print(f"[OK] 11. Dashboard stats updated. Total incidents: {dash2['total_incidents']}, Resolved: {dash2['status_counts']['RESOLVED']}")

    print("=" * 60)
    print("ALL 11 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_checks()
