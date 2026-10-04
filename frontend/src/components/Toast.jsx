import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const isSuccess = t.type === 'success';

        return (
          <div
            key={t.id}
            className={`toast ${
              isError ? 'toast-error' : isSuccess ? 'toast-success' : 'toast-info'
            }`}
          >
            {isSuccess && <CheckCircle2 size={20} color="#059669" />}
            {isError && <AlertTriangle size={20} color="#dc2626" />}
            {!isSuccess && !isError && <Info size={20} color="#0284c7" />}

            <div style={{ flex: 1, fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.title || (isError ? 'Error' : 'Notification')}</div>
              <div style={{ color: '#475569', marginTop: 2 }}>{t.message}</div>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
