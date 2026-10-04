import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Truck,
  Activity,
  Radio,
  Clock,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Flame,
  HeartPulse,
  Car,
  Shield,
  CloudLightning,
} from 'lucide-react';
import { fetchDashboardStats } from '../api';
import StateBadge from '../components/StateBadge';
import PriorityBadge from '../components/PriorityBadge';

const TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Accident: Car,
  Security: Shield,
  'Natural Disaster': CloudLightning,
};

export default function DashboardView({ onSelectIncident, onNavigateReport }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardStats();
      setStats(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading ERCS Command Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p>
        <button className="btn btn-primary" onClick={loadStats}>
          Retry Connection
        </button>
      </div>
    );
  }

  const statusCounts = stats?.status_counts || {};
  const typeCounts = stats?.type_counts || {};
  const priorityCounts = stats?.priority_counts || {};
  const unitStats = stats?.unit_stats || { total: 0, available: 0, assigned: 0, busy: 0 };
  const totalIncidents = stats?.total_incidents || 0;

  return (
    <div>
      {/* Academic Project Context Banner */}
      <div className="academic-banner">
        <div>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>
            SOFTWARE ENGINEERING PRACTICES (SEP) • CIAP MICRO PROJECT
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 4 }}>
            Emergency Response Coordination System (ERCS)
          </div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 4 }}>
            Demonstrating Finite State Machine Transitions & Interaction Sequence Flow under <strong>SDG 11 (Sustainable Cities & Communities)</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={onNavigateReport}>
            <PlusCircle size={16} />
            Report New Incident
          </button>
        </div>
      </div>

      {/* 6 Key Status Metrics Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{totalIncidents}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{statusCounts.REPORTED || 0}</div>
            <div className="stat-label">1. Reported (Pending)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{statusCounts.VERIFIED || 0}</div>
            <div className="stat-label">2. Verified</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Truck size={22} />
          </div>
          <div>
            <div className="stat-value">{statusCounts.DISPATCHED || 0}</div>
            <div className="stat-label">3. Dispatched</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#ffedd5', color: '#ea580c' }}>
            <Radio size={22} />
          </div>
          <div>
            <div className="stat-value">{statusCounts.RESPONDING || 0}</div>
            <div className="stat-label">4. Responding</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{statusCounts.RESOLVED || 0}</div>
            <div className="stat-label">5. Resolved</div>
          </div>
        </div>
      </div>

      {/* Grid: Unit Fleet Status + Distributions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Response Unit Fleet */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={18} color="#0284c7" />
              Response Fleet Availability
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Total: {unitStats.total} Units
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ padding: 12, background: '#d1fae5', borderRadius: 8 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46' }}>{unitStats.available}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065f46' }}>AVAILABLE</div>
              </div>
              <div style={{ padding: 12, background: '#dbeafe', borderRadius: 8 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e40af' }}>{unitStats.assigned}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>ASSIGNED</div>
              </div>
              <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b' }}>{unitStats.busy}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b' }}>BUSY</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
              * Under the dispatch state constraint, only units in <strong>AVAILABLE</strong> state can be assigned to verified incidents.
            </p>
          </div>
        </div>

        {/* Emergency Type Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="#d97706" />
              Emergency Type Distribution
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(typeCounts).map(([type, count]) => {
                const Icon = TYPE_ICONS[type] || AlertCircle;
                const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <Icon size={14} color="#64748b" />
                        {type}
                      </span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          background: '#0284c7',
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="#dc2626" />
              Priority Severity Breakdown
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((prio) => {
                const count = priorityCounts[prio] || 0;
                const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
                const barColor =
                  prio === 'CRITICAL'
                    ? '#dc2626'
                    : prio === 'HIGH'
                    ? '#ea580c'
                    : prio === 'MEDIUM'
                    ? '#0284c7'
                    : '#64748b';

                return (
                  <div key={prio}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <PriorityBadge priority={prio} />
                      <span style={{ color: '#64748b', fontWeight: 600 }}>
                        {count} incidents
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          background: barColor,
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={18} color="#0284c7" />
            Active Emergency Incidents
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Click an incident to inspect state lifecycle & actions
          </span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Current State</th>
                <th>Assigned Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_incidents?.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                      {inc.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{inc.emergency_type}</span>
                  </td>
                  <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inc.location}
                  </td>
                  <td>
                    <PriorityBadge priority={inc.priority} />
                  </td>
                  <td>
                    <StateBadge status={inc.status} />
                  </td>
                  <td>
                    {inc.unit_name ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                        <Truck size={14} color="#2563eb" />
                        {inc.unit_name}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectIncident(inc.id)}
                    >
                      Inspect State
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
