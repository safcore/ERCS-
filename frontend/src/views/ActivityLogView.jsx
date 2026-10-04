import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  User,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { fetchDashboardStats } from '../api';
import StateBadge from '../components/StateBadge';
import { ACTORS } from '../types';

export default function ActivityLogView({ onSelectIncident }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardStats();
      setEvents(res.recent_events || []);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = actorFilter
    ? events.filter((e) => e.actor === actorFilter)
    : events;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
          System Sequence Activity & Audit Log
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Append-only chronological timeline verifying the sequence of interactions between Actors and System
        </p>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} /> Filter by Actor:
          </span>
          <select
            className="form-select"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 200 }}
          >
            <option value="">All Actors</option>
            {ACTORS.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <History size={18} color="#0284c7" />
            Chronological Sequence Events ({filteredEvents.length})
          </h3>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>Loading audit events...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>No events recorded for this filter.</div>
          ) : (
            <div className="timeline">
              {filteredEvents.map((ev) => (
                <div key={ev.id} className="timeline-item">
                  <div className="timeline-dot">
                    <Clock size={12} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="timeline-title">{ev.action}</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectIncident(ev.incident_id)}
                          style={{ padding: '1px 6px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}
                        >
                          {ev.incident_id} <ArrowRight size={10} />
                        </button>
                      </div>
                      <span className="timeline-time">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#334155', padding: '1px 8px', borderRadius: 4, fontWeight: 600 }}>
                        Actor: {ev.actor}
                      </span>
                      {ev.from_state ? (
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                          State Transition: <code>{ev.from_state}</code> → <strong style={{ color: '#0284c7' }}>{ev.to_state}</strong>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                          Initial State: <strong style={{ color: '#d97706' }}>{ev.to_state}</strong>
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
  );
}
