import React, { useState, useEffect } from 'react';
import {
  Truck,
  Shield,
  HeartPulse,
  Flame,
  LifeBuoy,
  MapPin,
  AlertCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { fetchResponseUnits } from '../api';

const UNIT_TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Police: Shield,
  Rescue: LifeBuoy,
};

export default function ResponseUnitsView({ onSelectIncident }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadUnits = async () => {
    try {
      setLoading(true);
      const res = await fetchResponseUnits({
        status: statusFilter,
        type: typeFilter,
      });
      setUnits(res.units || []);
    } catch (err) {
      console.error('Failed to load units', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [statusFilter, typeFilter]);

  const availableCount = units.filter((u) => u.status === 'AVAILABLE').length;
  const assignedCount = units.filter((u) => u.status === 'ASSIGNED').length;
  const busyCount = units.filter((u) => u.status === 'BUSY').length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
          Emergency Response Units Fleet
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Response resource allocation and real-time operational availability status
        </p>
      </div>

      {/* Fleet Status Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#0f172a" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{units.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Fleet Units</div>
          </div>
        </div>

        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#065f46' }}>{availableCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>AVAILABLE FOR DISPATCH</div>
          </div>
        </div>

        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e40af' }}>{assignedCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>EN ROUTE (ASSIGNED)</div>
          </div>
        </div>

        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#991b1b' }}>{busyCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>ON SCENE (BUSY)</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} /> Filter Units:
          </span>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE Only</option>
            <option value="ASSIGNED">ASSIGNED Only</option>
            <option value="BUSY">BUSY Only</option>
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="">All Unit Types</option>
            <option value="Fire">Fire Engines</option>
            <option value="Medical">Medical Ambulances</option>
            <option value="Police">Police Patrols</option>
            <option value="Rescue">Rescue Teams</option>
          </select>
        </div>
      </div>

      {/* Grid of Unit Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading response units...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {units.map((unit) => {
            const Icon = UNIT_TYPE_ICONS[unit.type] || Truck;
            const isAvailable = unit.status === 'AVAILABLE';
            const isAssigned = unit.status === 'ASSIGNED';
            const isBusy = unit.status === 'BUSY';

            return (
              <div key={unit.id} className="card">
                <div className="card-header" style={{ background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{unit.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: '#64748b' }}>
                        {unit.id} • {unit.type} Unit
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-unit-${unit.status}`}>
                    {unit.status}
                  </span>
                </div>

                <div className="card-body">
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <MapPin size={13} />
                    <span>Station: {unit.station_location}</span>
                  </div>

                  {unit.current_incident_id ? (
                    <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Current Incident Deployment:
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7', marginRight: 6 }}>
                            {unit.current_incident_id}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {unit.incident_type} ({unit.incident_location})
                          </span>
                        </div>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectIncident(unit.current_incident_id)}
                          style={{ padding: '3px 8px', fontSize: '0.725rem' }}
                        >
                          View <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#059669', fontStyle: 'italic', background: '#ecfdf5', padding: '8px 12px', borderRadius: 6 }}>
                      ✓ Standing by at station — ready for immediate coordinator dispatch.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
