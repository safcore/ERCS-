import React from 'react';
import {
  Siren,
  LayoutDashboard,
  AlertCircle,
  PlusCircle,
  Truck,
  History,
  Workflow,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { ACTORS } from '../types';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentActor,
  setCurrentActor,
  onResetDemo,
  isResetting,
}) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo-badge" title="ERCS Emergency Command">
            <Siren size={22} />
          </div>
          <div>
            <div className="brand-title">Emergency Response Coordination System</div>
            <div className="brand-subtitle">
              <span>SEP Micro Project</span>
              <span>•</span>
              <span className="brand-tag">Roll No: 124BTCS1031</span>
              <span>•</span>
              <span style={{ color: '#38bdf8' }}>SDG 11: Sustainable Cities</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <AlertCircle size={16} />
            Incidents
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <PlusCircle size={16} />
            Report Emergency
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'units' ? 'active' : ''}`}
            onClick={() => setActiveTab('units')}
          >
            <Truck size={16} />
            Response Units
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <History size={16} />
            Activity Log
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'model' ? 'active' : ''}`}
            onClick={() => setActiveTab('model')}
          >
            <Workflow size={16} />
            Model & Viva
          </button>
        </nav>

        {/* Actor Role & Reset */}
        <div className="nav-actions">
          <div className="role-switcher" title="Select current simulated actor">
            <UserCheck size={14} color="#38bdf8" />
            <span>Actor:</span>
            <select
              className="role-select"
              value={currentActor}
              onChange={(e) => setCurrentActor(e.target.value)}
            >
              {ACTORS.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset database to initial demonstration dataset"
            style={{
              background: '#1e293b',
              borderColor: '#334155',
              color: '#e2e8f0',
            }}
          >
            <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
