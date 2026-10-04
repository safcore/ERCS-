import React from 'react';
import {
  Workflow,
  CheckCircle,
  XCircle,
  FileText,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Award,
  HelpCircle,
} from 'lucide-react';
import { INCIDENT_STATUSES, VALID_TRANSITIONS } from '../types';

export default function AcademicModelView() {
  return (
    <div>
      {/* Academic Meta Header */}
      <div className="academic-banner" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>
            SEP CIAP MICRO PROJECT • ACADEMIC DEFENSE & MODEL SPECIFICATION
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
            Sequence & State Modelling Specification
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span><strong>Course:</strong> Software Engineering Practices (SEP)</span>
            <span>•</span>
            <span><strong>Student Roll No:</strong> 124BTCS1031</span>
            <span>•</span>
            <span style={{ color: '#38bdf8' }}><strong>SDG:</strong> SDG 11 (Sustainable Cities & Communities)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 14px', borderRadius: 8 }}>
          <Award size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem', color: '#e0f2fe', fontWeight: 600 }}>
            Presentation & Viva Ready Prototype
          </span>
        </div>
      </div>

      {/* Section 1: Formal State Model & Lifecycle */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">
            <Workflow size={18} color="#0284c7" />
            1. Finite State Machine (FSM) Lifecycle Model
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Strict Linear Progression with Server-side Invariant Enforcement
          </span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 16 }}>
            The ERCS incident state model follows a strictly deterministic directed lifecycle. Every transition must satisfy explicit precondition predicates enforced at the backend REST API layer.
          </p>

          {/* Stepper Visual Representation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: '#f8fafc', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
            {[
              { state: 'REPORTED', desc: 'Registered by citizen / reporter' },
              { state: 'VERIFIED', desc: 'Confirmed legitimate by coordinator' },
              { state: 'DISPATCHED', desc: 'Available unit assigned & en route' },
              { state: 'RESPONDING', desc: 'Unit on scene; operations active' },
              { state: 'RESOLVED', desc: 'Hazard mitigated; unit freed' },
            ].map((st, idx, arr) => (
              <React.Fragment key={st.state}>
                <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
                  <div style={{ display: 'inline-block', padding: '6px 12px', background: '#0284c7', color: 'white', borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {st.state}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>{st.desc}</div>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Transition Matrix Table */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
              State Transition Validation Matrix
            </h4>
            <div className="table-container">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>From State \ To State</th>
                    {INCIDENT_STATUSES.map((toSt) => (
                      <th key={toSt}>{toSt}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INCIDENT_STATUSES.map((fromSt) => (
                    <tr key={fromSt}>
                      <td style={{ fontWeight: 700, background: '#f8fafc', textAlign: 'left' }}>
                        {fromSt}
                      </td>
                      {INCIDENT_STATUSES.map((toSt) => {
                        const isAllowed = VALID_TRANSITIONS[fromSt]?.includes(toSt);
                        const isSame = fromSt === toSt;

                        if (isSame) {
                          return (
                            <td key={toSt} className="cell-na" title="Self-loop not permitted">
                              —
                            </td>
                          );
                        }
                        if (isAllowed) {
                          return (
                            <td key={toSt} className="cell-valid" title="Valid transition">
                              ✓ VALID
                            </td>
                          );
                        }
                        return (
                          <td key={toSt} className="cell-invalid" title="Rejected with 400 Bad Request">
                            ✗ INVALID
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
              * Any cell marked <strong>✗ INVALID</strong> returns HTTP status 400 with a structured error explanation if attempted.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Sequence Modelling & Actor Interactions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">
            <BookOpen size={18} color="#0284c7" />
            2. Actor Sequence Model & Interaction Workflow
          </h3>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 16 }}>
            The ERCS interaction model defines how the three primary stakeholders interact with the coordination engine across time:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                step: 'Step 1: Emergency Reporting',
                actor: 'Emergency Reporter (Citizen / Sensor)',
                action: 'Submits Emergency Report (type, location, priority)',
                system: 'ERCS validates required fields, stores record in SQLite with status REPORTED, generates ID (e.g. ER-001), and logs creation event.',
              },
              {
                step: 'Step 2: Incident Verification',
                actor: 'Emergency Coordinator (Dispatch Officer)',
                action: 'Reviews incident queue, verifies authenticity via CCTV/caller contact, triggers Verification',
                system: 'ERCS validates state precondition (must be REPORTED), updates status to VERIFIED, records verification audit record.',
              },
              {
                step: 'Step 3: Response Unit Allocation',
                actor: 'Emergency Coordinator',
                action: 'Queries available fleet, selects compatible AVAILABLE unit, triggers Dispatch',
                system: 'ERCS verifies unit is AVAILABLE (rejects if BUSY or ASSIGNED), binds unit to incident, sets unit status to ASSIGNED, transitions incident to DISPATCHED.',
              },
              {
                step: 'Step 4: Operations Commencement',
                actor: 'Response Unit (Fire Engine / Ambulance / Police)',
                action: 'Receives dispatch order, departs station, confirms arrival on-scene',
                system: 'ERCS updates assigned unit status to BUSY, transitions incident status to RESPONDING, records timestamp.',
              },
              {
                step: 'Step 5: Mitigation & Incident Closure',
                actor: 'Emergency Coordinator / Incident Commander',
                action: 'Confirms hazard neutralized, inputs resolution summary notes, triggers Resolution',
                system: 'ERCS transitions incident to terminal status RESOLVED, releases response unit back to AVAILABLE, records final audit log.',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.9rem' }}>{s.step}</span>
                  <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                    Actor: {s.actor}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: 4 }}>
                  <strong>Action:</strong> {s.action}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#ffffff', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <strong>System Response:</strong> {s.system}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Viva Voce Defense Guide */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">
            <HelpCircle size={18} color="#d97706" />
            3. Viva Voce Defense Guide & Expected Questions
          </h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: 4 }}>
                Q1: How does your implementation prevent invalid state transitions like REPORTED → RESOLVED?
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                <strong>Answer:</strong> The state transitions are enforced server-side inside <code>backend/models.py</code> and <code>backend/routes/incidents.py</code> using an explicit transition map. When an API call is made, <code>validate_transition()</code> checks the current state against permitted target states. If invalid, the request is rejected immediately with HTTP 400 Bad Request and an explanatory message. Frontend buttons are also conditionally disabled for UX, but the core security invariant is enforced on the server.
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: 4 }}>
                Q2: How does the system satisfy the SDG 11 (Sustainable Cities and Communities) goal?
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                <strong>Answer:</strong> SDG Target 11.5 aims to significantly reduce the number of deaths and people affected by disasters. By formalizing emergency incident state transitions and unit availability constraints, ERCS eliminates dispatch errors, prevents phantom unit allocation, and maintains an unalterable audit trail, thereby increasing municipal urban resilience and public safety.
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: 4 }}>
                Q3: Why is an append-only audit trail essential for sequence modelling?
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                <strong>Answer:</strong> A sequence diagram models interactions over an ordered timeline. In our database table <code>incident_events</code>, records are append-only: every time any actor (Reporter, Coordinator, or Response Unit) triggers a state shift, the timestamp, actor identity, action name, and state delta are persisted immutably. This proves that the implemented system strictly reflects the theoretical sequence model.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
