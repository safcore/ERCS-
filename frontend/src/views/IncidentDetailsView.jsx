import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Truck,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Phone,
  FileText,
  ShieldCheck,
  Send,
  Radio,
  Flame,
  HeartPulse,
  Car,
  Shield,
  CloudLightning,
  AlertOctagon,
} from 'lucide-react';
import {
  fetchIncidentById,
  verifyIncident,
  dispatchIncident,
  respondIncident,
  resolveIncident,
  attemptArbitraryTransition,
  fetchResponseUnits,
} from '../api';
import StateBadge from '../components/StateBadge';
import PriorityBadge from '../components/PriorityBadge';
import StateProgressStepper from '../components/StateProgressStepper';
import Modal from '../components/Modal';
import { INCIDENT_STATUSES } from '../types';

const TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Accident: Car,
  Security: Shield,
  'Natural Disaster': CloudLightning,
};

export default function IncidentDetailsView({
  incidentId,
  onBack,
  currentActor,
  addToast,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');

  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [respondNotes, setRespondNotes] = useState('');

  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');

  // Academic transition test state
  const [testTargetState, setTestTargetState] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTestingTransition, setIsTestingTransition] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const loadIncident = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidentById(incidentId);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const incident = data?.incident;
  const events = data?.events || [];
  const currentStatus = incident?.status || 'REPORTED';

  // 1. Handle Verify
  const handleVerify = async () => {
    try {
      setActionLoading(true);
      const res = await verifyIncident(incident.id, verifyNotes, currentActor);
      addToast({
        type: 'success',
        title: 'Incident Verified',
        message: res.message,
      });
      setIsVerifyOpen(false);
      setVerifyNotes('');
      await loadIncident();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Open Dispatch Modal & load available units
  const openDispatchModal = async () => {
    try {
      setActionLoading(true);
      const res = await fetchResponseUnits({ status: 'AVAILABLE' });
      setAvailableUnits(res.units || []);
      if (res.units && res.units.length > 0) {
        setSelectedUnitId(res.units[0].id);
      } else {
        setSelectedUnitId('');
      }
      setIsDispatchOpen(true);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to fetch units',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Handle Dispatch Submit
  const handleDispatch = async () => {
    if (!selectedUnitId) {
      addToast({
        type: 'error',
        title: 'Unit Required',
        message: 'Please select an available response unit.',
      });
      return;
    }

    try {
      setActionLoading(true);
      const res = await dispatchIncident(incident.id, selectedUnitId, dispatchNotes, currentActor);
      addToast({
        type: 'success',
        title: 'Unit Dispatched',
        message: res.message,
      });
      setIsDispatchOpen(false);
      setDispatchNotes('');
      await loadIncident();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Handle Respond
  const handleRespond = async () => {
    try {
      setActionLoading(true);
      const res = await respondIncident(incident.id, respondNotes, currentActor);
      addToast({
        type: 'success',
        title: 'Response Commenced',
        message: res.message,
      });
      setIsRespondOpen(false);
      setRespondNotes('');
      await loadIncident();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Response Update Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Handle Resolve
  const handleResolve = async () => {
    try {
      setActionLoading(true);
      const res = await resolveIncident(incident.id, resolveNotes, currentActor);
      addToast({
        type: 'success',
        title: 'Incident Resolved',
        message: res.message,
      });
      setIsResolveOpen(false);
      setResolveNotes('');
      await loadIncident();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Resolution Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Test Arbitrary State Transition (Academic feature)
  const handleTestArbitraryTransition = async () => {
    if (!testTargetState) return;
    try {
      setIsTestingTransition(true);
      setTestResult(null);
      const res = await attemptArbitraryTransition(incident.id, testTargetState);
      setTestResult({
        success: true,
        message: res.message,
        details: res,
      });
    } catch (err) {
      setTestResult({
        success: false,
        status: err.status || 400,
        message: err.message,
        details: err.data || {},
      });
    } finally {
      setIsTestingTransition(false);
    }
  };

  if (loading && !incident) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Incident Record...</div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: 12 }}>{error || 'Incident not found'}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Incidents
        </button>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[incident.emergency_type] || AlertTriangle;

  // State machine active flags
  const canVerify = currentStatus === 'REPORTED';
  const canDispatch = currentStatus === 'VERIFIED';
  const canRespond = currentStatus === 'DISPATCHED';
  const canResolve = currentStatus === 'RESPONDING';
  const isTerminal = currentStatus === 'RESOLVED';

  return (
    <div>
      {/* Top back button & breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to List
        </button>
        <span style={{ color: '#94a3b8' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
          {incident.id}
        </span>
        <StateBadge status={currentStatus} />
      </div>

      {/* Main Incident Overview Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TypeIcon size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {incident.id} — {incident.emergency_type} Emergency
                </h2>
                <PriorityBadge priority={incident.priority} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <MapPin size={13} />
                <span>{incident.location}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reported Timestamp</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {new Date(incident.reported_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Visual State Progress Stepper */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: 6 }}>
              Incident Lifecycle State Progression (FSM Model)
            </div>
            <StateProgressStepper currentStatus={currentStatus} />
          </div>

          {/* Incident Attributes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileText size={13} /> Incident Description
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>{incident.description}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={13} /> Reporter Information
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{incident.reported_by}</div>
              {incident.contact_number && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Phone size={12} /> {incident.contact_number}
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Truck size={13} /> Assigned Response Unit
              </div>
              {incident.unit_name ? (
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={15} />
                    {incident.unit_name} ({incident.unit_type})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                    Station: {incident.station_location || 'Central Dispatch'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No response unit assigned yet
                </div>
              )}
            </div>
          </div>

          {/* Verification Notes if verified */}
          {incident.verification_notes && (
            <div style={{ background: '#ede9fe', padding: 12, borderRadius: 8, border: '1px solid #ddd6fe', marginBottom: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <ShieldCheck size={14} /> Verification Record
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4c1d95' }}>{incident.verification_notes}</div>
            </div>
          )}

          {/* Resolution Notes if resolved */}
          {incident.resolution_notes && (
            <div style={{ background: '#d1fae5', padding: 12, borderRadius: 8, border: '1px solid #a7f3d0', marginBottom: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <CheckCircle size={14} /> Incident Resolution Record
              </div>
              <div style={{ fontSize: '0.85rem', color: '#064e3b' }}>{incident.resolution_notes}</div>
            </div>
          )}

          {/* STRICT STATE MACHINE ACTION TOOLBAR */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Permitted State Transition Actions
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Enforced by ERCS Finite State Machine (Actor: <strong style={{ color: '#0284c7' }}>{currentActor}</strong>)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Action 1: Verify */}
              <button
                className="btn btn-purple"
                disabled={!canVerify || actionLoading}
                onClick={() => setIsVerifyOpen(true)}
                title={canVerify ? 'Review and verify reported incident' : 'Allowed only when status is REPORTED'}
              >
                <ShieldCheck size={16} />
                1. Verify Incident
              </button>

              {/* Action 2: Dispatch */}
              <button
                className="btn btn-primary"
                disabled={!canDispatch || actionLoading}
                onClick={openDispatchModal}
                title={canDispatch ? 'Assign an available response unit' : 'Allowed only when status is VERIFIED'}
              >
                <Truck size={16} />
                2. Dispatch Unit
              </button>

              {/* Action 3: Respond */}
              <button
                className="btn btn-warning"
                disabled={!canRespond || actionLoading}
                onClick={() => setIsRespondOpen(true)}
                title={canRespond ? 'Unit departs and starts responding' : 'Allowed only when status is DISPATCHED'}
              >
                <Radio size={16} />
                3. Start Response
              </button>

              {/* Action 4: Resolve */}
              <button
                className="btn btn-success"
                disabled={!canResolve || actionLoading}
                onClick={() => setIsResolveOpen(true)}
                title={canResolve ? 'Conclude response and free unit' : 'Allowed only when status is RESPONDING'}
              >
                <CheckCircle size={16} />
                4. Resolve Incident
              </button>

              {isTerminal && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
                  <CheckCircle size={15} color="#059669" />
                  Terminal State: Incident fully closed & archived.
                </div>
              )}
            </div>

            {/* Explanation text below buttons */}
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#64748b' }}>
              {canVerify && '• Next valid step: Coordinator must verify incident authenticity before response units can be dispatched.'}
              {canDispatch && '• Next valid step: Coordinator assigns an AVAILABLE response unit (RU) to transition to DISPATCHED.'}
              {canRespond && '• Next valid step: Response Unit accepts call and commences operations on-scene.'}
              {canResolve && '• Next valid step: Emergency is mitigated; resolving incident releases assigned unit back to AVAILABLE.'}
              {isTerminal && '• No further transitions permitted. Terminal state reached.'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Academic Transition Rule Tester & Append-only Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Academic Feature: Test Invalid Transitions */}
        <div className="card">
          <div className="card-header" style={{ background: '#f8fafc' }}>
            <h3 className="card-title">
              <AlertOctagon size={18} color="#dc2626" />
              Academic Viva Test: State Transition Validator
            </h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: 14 }}>
              Demonstrate that the Flask REST backend strictly validates and rejects illegal transitions (e.g., jumping from <strong>{currentStatus}</strong> directly to an invalid state).
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <select
                className="form-select"
                value={testTargetState}
                onChange={(e) => setTestTargetState(e.target.value)}
              >
                <option value="">Select Target State to Test...</option>
                {INCIDENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Attempt Jump to: {st}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-danger"
                disabled={!testTargetState || isTestingTransition}
                onClick={handleTestArbitraryTransition}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Send size={14} />
                Test API
              </button>
            </div>

            {/* Test result output box */}
            {testResult && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 8,
                  fontSize: '0.825rem',
                  border: testResult.success ? '1px solid #a7f3d0' : '1px solid #fca5a5',
                  background: testResult.success ? '#ecfdf5' : '#fef2f2',
                  color: testResult.success ? '#065f46' : '#991b1b',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {testResult.success ? (
                    <>
                      <CheckCircle size={16} color="#059669" />
                      Status 200 OK — Permitted Transition
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} color="#dc2626" />
                      Status 400 Bad Request — Illegal State Transition Rejected!
                    </>
                  )}
                </div>
                <div>{testResult.message}</div>
                {!testResult.success && testResult.details?.allowed_next_states && (
                  <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#7f1d1d' }}>
                    Allowed next states from '{currentStatus}': [
                    {testResult.details.allowed_next_states.join(', ') || 'None (Terminal)'}
                    ]
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Append-Only Event Sequence History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="#0284c7" />
              Incident Sequence Audit Trail ({events.length} Events)
            </h3>
          </div>
          <div className="card-body">
            {events.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No logged events recorded.</p>
            ) : (
              <div className="timeline">
                {events.map((ev) => (
                  <div key={ev.id} className="timeline-item">
                    <div className="timeline-dot">
                      <Clock size={12} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">{ev.action}</span>
                        <span className="timeline-time">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#334155', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                          Actor: {ev.actor}
                        </span>
                        {ev.from_state ? (
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {ev.from_state} → <strong style={{ color: '#0f172a' }}>{ev.to_state}</strong>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Initial State: <strong>{ev.to_state}</strong>
                          </span>
                        )}
                      </div>
                      {ev.notes && <p className="timeline-notes">{ev.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Verify Incident */}
      <Modal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} title="Verify Incident Authenticity">
        <div className="form-group">
          <label className="form-label">Verification Notes</label>
          <textarea
            className="form-textarea"
            placeholder="e.g., Coordinator verified caller identity and cross-checked traffic cameras."
            value={verifyNotes}
            onChange={(e) => setVerifyNotes(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setIsVerifyOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-purple" onClick={handleVerify} disabled={actionLoading}>
            Confirm Verification (VERIFIED)
          </button>
        </div>
      </Modal>

      {/* Modal 2: Dispatch Response Unit */}
      <Modal isOpen={isDispatchOpen} onClose={() => setIsDispatchOpen(false)} title="Dispatch Emergency Response Unit">
        {availableUnits.length === 0 ? (
          <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: '0.85rem' }}>
            <AlertTriangle size={18} style={{ display: 'inline', marginRight: 6 }} />
            No response units are currently <strong>AVAILABLE</strong> in the fleet. Please wait for an active unit to be resolved.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">
                Select Available Unit <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
              >
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.type} Unit) — {u.station_location}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dispatch Instructions / Notes</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., Priority route via Western Express Highway. Coordinate with local patrol."
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setIsDispatchOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleDispatch} disabled={actionLoading || !selectedUnitId}>
                Dispatch Unit (DISPATCHED)
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal 3: Start Response */}
      <Modal isOpen={isRespondOpen} onClose={() => setIsRespondOpen(false)} title="Commence On-Scene Emergency Response">
        <div className="form-group">
          <label className="form-label">Response Notes</label>
          <textarea
            className="form-textarea"
            placeholder="e.g., Fire Unit arrived at site. Water tenders deployed. Perimeter cordoned."
            value={respondNotes}
            onChange={(e) => setRespondNotes(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setIsRespondOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-warning" onClick={handleRespond} disabled={actionLoading}>
            Commence Response (RESPONDING)
          </button>
        </div>
      </Modal>

      {/* Modal 4: Resolve Incident */}
      <Modal isOpen={isResolveOpen} onClose={() => setIsResolveOpen(false)} title="Resolve & Close Emergency Incident">
        <div className="form-group">
          <label className="form-label">Resolution Summary</label>
          <textarea
            className="form-textarea"
            placeholder="e.g., Transformer blaze extinguished. No casualties. Site secured and handed over to municipal electricity engineers."
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setIsResolveOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleResolve} disabled={actionLoading}>
            Resolve Incident (RESOLVED)
          </button>
        </div>
      </Modal>
    </div>
  );
}
