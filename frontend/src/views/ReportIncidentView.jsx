import React, { useState } from 'react';
import {
  Send,
  AlertOctagon,
  CheckCircle,
  MapPin,
  FileText,
  User,
  Phone,
  ArrowRight,
  Flame,
  HeartPulse,
  Car,
  Shield,
  CloudLightning,
} from 'lucide-react';
import { createIncident } from '../api';
import { EMERGENCY_TYPES, PRIORITIES } from '../types';

const TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Accident: Car,
  Security: Shield,
  'Natural Disaster': CloudLightning,
};

export default function ReportIncidentView({ onIncidentCreated, addToast }) {
  const [formData, setFormData] = useState({
    emergency_type: 'Fire',
    priority: 'HIGH',
    location: '',
    description: '',
    reported_by: '',
    contact_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [createdIncident, setCreatedIncident] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.location.trim()) errs.location = 'Incident location is required.';
    if (!formData.description.trim()) errs.description = 'Incident description is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await createIncident(formData);
      setCreatedIncident(res.incident);
      addToast({
        type: 'success',
        title: 'Emergency Reported',
        message: res.message,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      emergency_type: 'Fire',
      priority: 'HIGH',
      location: '',
      description: '',
      reported_by: '',
      contact_number: '',
    });
    setCreatedIncident(null);
    setErrors({});
  };

  if (createdIncident) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#d1fae5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Emergency Incident Registered!
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: 20 }}>
            The incident has been recorded in the system and placed in the initial state{' '}
            <strong style={{ color: '#d97706' }}>REPORTED</strong>.
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 16,
              textAlign: 'left',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned ID:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                {createdIncident.id}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Emergency Type:</span>
              <span style={{ fontWeight: 600 }}>{createdIncident.emergency_type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Priority:</span>
              <span style={{ fontWeight: 600, color: '#dc2626' }}>{createdIncident.priority}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Location:</span>
              <span style={{ fontWeight: 500 }}>{createdIncident.location}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={handleResetForm}>
              Report Another Emergency
            </button>
            <button className="btn btn-primary" onClick={() => onIncidentCreated(createdIncident.id)}>
              Inspect & Coordinate Incident <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
          Report Emergency Incident
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Sequence Step 1: Emergency Reporter submits incident into the coordination system
        </p>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: '#f8fafc' }}>
          <h3 className="card-title">
            <AlertOctagon size={18} color="#dc2626" />
            Emergency Intake Form
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            * All emergencies initialize in state: <strong>REPORTED</strong>
          </span>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Emergency Type & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  Emergency Type <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.emergency_type}
                  onChange={(e) => setFormData({ ...formData, emergency_type: e.target.value })}
                >
                  {EMERGENCY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Priority Severity <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Location */}
            <div className="form-group">
              <label className="form-label">
                Incident Location & Landmark <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Andheri East, MIDC Cross Road No. 8 (Near Apex Tower)"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (errors.location) setErrors({ ...errors, location: null });
                }}
              />
              {errors.location && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.location}</div>}
            </div>

            {/* Row 3: Description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Emergency Description <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe what happened, any visible hazard, injuries, or structures involved..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
              />
              {errors.description && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>{errors.description}</div>}
            </div>

            {/* Row 4: Reporter & Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Reporter Name / Role</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Aarav Sharma (Resident / Guard)"
                  value={formData.reported_by}
                  onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Callback Contact Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                <Send size={16} />
                {loading ? 'Submitting...' : 'Register Emergency'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
