import React from 'react';

const PRIORITY_CONFIGS = {
  LOW: { label: 'LOW', class: 'badge-priority-LOW' },
  MEDIUM: { label: 'MEDIUM', class: 'badge-priority-MEDIUM' },
  HIGH: { label: 'HIGH', class: 'badge-priority-HIGH' },
  CRITICAL: { label: 'CRITICAL', class: 'badge-priority-CRITICAL' },
};

export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIGS[priority] || {
    label: priority,
    class: 'badge-priority-MEDIUM',
  };

  return (
    <span className={`badge ${config.class}`}>
      {config.label}
    </span>
  );
}
