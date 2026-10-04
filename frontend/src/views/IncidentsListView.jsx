import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  Truck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { fetchIncidents } from '../api';
import StateBadge from '../components/StateBadge';
import PriorityBadge from '../components/PriorityBadge';
import { INCIDENT_STATUSES, EMERGENCY_TYPES, PRIORITIES } from '../types';

export default function IncidentsListView({ onSelectIncident, onNavigateReport }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidents({
        search,
        status: statusFilter,
        priority: priorityFilter,
        type: typeFilter,
      });
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, priorityFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadIncidents();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
  };

  return (
    <div>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Emergency Incident Registry
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Inspect, filter, and track incidents across the 5-state emergency lifecycle
          </p>
        </div>
        <button className="btn btn-primary" onClick={onNavigateReport}>
          <PlusCircle size={16} />
          Report Emergency
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search by ID, location, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
          </div>

          {/* Status filter */}
          <div style={{ flex: '0 1 170px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {INCIDENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div style={{ flex: '0 1 150px' }}>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div style={{ flex: '0 1 160px' }}>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Emergency Types</option>
              {EMERGENCY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Search
          </button>

          {(search || statusFilter || priorityFilter || typeFilter) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ color: '#ef4444' }}
            >
              Clear Filters
            </button>
          )}
        </form>
      </div>

      {/* Incidents Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={18} color="#0284c7" />
            Matching Incidents ({incidents.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#334155' }}>No incidents matched your query.</div>
            <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
              Try adjusting your search filters or register a new emergency incident.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>State</th>
                  <th>Assigned Unit</th>
                  <th>Reported Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                        {inc.id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{inc.emergency_type}</span>
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {inc.location}
                    </td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#475569' }}>
                      {inc.description}
                    </td>
                    <td>
                      <PriorityBadge priority={inc.priority} />
                    </td>
                    <td>
                      <StateBadge status={inc.status} />
                    </td>
                    <td>
                      {inc.unit_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500, fontSize: '0.8rem' }}>
                          <Truck size={14} color="#2563eb" />
                          {inc.unit_name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onSelectIncident(inc.id)}
                      >
                        Inspect
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
