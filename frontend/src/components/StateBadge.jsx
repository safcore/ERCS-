import React from 'react';

const STATUS_CONFIGS = {
  REPORTED: { label: 'REPORTED', class: 'badge-status-REPORTED', dot: '#d97706' },
  VERIFIED: { label: 'VERIFIED', class: 'badge-status-VERIFIED', dot: '#7c3aed' },
  DISPATCHED: { label: 'DISPATCHED', class: 'badge-status-DISPATCHED', dot: '#2563eb' },
  RESPONDING: { label: 'RESPONDING', class: 'badge-status-RESPONDING', dot: '#ea580c' },
  RESOLVED: { label: 'RESOLVED', class: 'badge-status-RESOLVED', dot: '#10b981' },
};

export default function StateBadge({ status }) {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    class: 'badge-status-REPORTED',
    dot: '#64748b',
  };

  return (
    <span className={`badge ${config.class}`}>
      <span className="badge-dot" style={{ backgroundColor: config.dot }} />
      {config.label}
    </span>
  );
}
