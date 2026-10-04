import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import DashboardView from './views/DashboardView';
import IncidentsListView from './views/IncidentsListView';
import IncidentDetailsView from './views/IncidentDetailsView';
import ReportIncidentView from './views/ReportIncidentView';
import ResponseUnitsView from './views/ResponseUnitsView';
import ActivityLogView from './views/ActivityLogView';
import AcademicModelView from './views/AcademicModelView';
import { resetDemoDatabase } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [currentActor, setCurrentActor] = useState('Emergency Coordinator');
  const [toasts, setToasts] = useState([]);
  const [isResetting, setIsResetting] = useState(false);

  // Toast notification manager
  const addToast = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Quick navigation handlers
  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
  };

  const handleBackToList = () => {
    setSelectedIncidentId(null);
  };

  const handleNavigateReport = () => {
    setSelectedIncidentId(null);
    setActiveTab('report');
  };

  const handleIncidentCreated = (newId) => {
    setSelectedIncidentId(newId);
  };

  // Reset Demo Database handler
  const handleResetDemo = async () => {
    if (!window.confirm('Reset database to initial demonstration seed state?')) {
      return;
    }

    try {
      setIsResetting(true);
      const res = await resetDemoDatabase();
      addToast({
        type: 'success',
        title: 'Demo Data Reset',
        message: res.message,
      });
      // Return to dashboard
      setSelectedIncidentId(null);
      setActiveTab('dashboard');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedIncidentId(null);
          setActiveTab(tab);
        }}
        currentActor={currentActor}
        setCurrentActor={setCurrentActor}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {selectedIncidentId ? (
          <IncidentDetailsView
            incidentId={selectedIncidentId}
            onBack={handleBackToList}
            currentActor={currentActor}
            addToast={addToast}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onSelectIncident={handleSelectIncident}
                onNavigateReport={handleNavigateReport}
              />
            )}

            {activeTab === 'incidents' && (
              <IncidentsListView
                onSelectIncident={handleSelectIncident}
                onNavigateReport={handleNavigateReport}
              />
            )}

            {activeTab === 'report' && (
              <ReportIncidentView
                onIncidentCreated={handleIncidentCreated}
                addToast={addToast}
              />
            )}

            {activeTab === 'units' && (
              <ResponseUnitsView onSelectIncident={handleSelectIncident} />
            )}

            {activeTab === 'activity' && (
              <ActivityLogView onSelectIncident={handleSelectIncident} />
            )}

            {activeTab === 'model' && <AcademicModelView />}
          </>
        )}
      </main>

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
