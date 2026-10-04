import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { INCIDENT_STATUSES } from '../types';

export default function StateProgressStepper({ currentStatus }) {
  const currentIndex = INCIDENT_STATUSES.indexOf(currentStatus);
  const progressPercent = currentIndex >= 0 ? (currentIndex / (INCIDENT_STATUSES.length - 1)) * 100 : 0;

  return (
    <div className="stepper-container">
      {/* Background track line */}
      <div className="stepper-line">
        <div
          className="stepper-progress"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {INCIDENT_STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        let stepClass = 'stepper-step';
        if (isCompleted) stepClass += ' completed';
        if (isCurrent) stepClass += ' current';
        if (isPending) stepClass += ' pending';

        return (
          <div key={status} className={stepClass}>
            <div className="stepper-circle">
              {isCompleted ? (
                <Check size={18} strokeWidth={2.5} />
              ) : isCurrent ? (
                <span>{index + 1}</span>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="stepper-label">{status}</div>
          </div>
        );
      })}
    </div>
  );
}
