/**
 * ERCS API Client Module
 * Communicates with the Flask REST Backend
 * Roll No: 124BTCS1031
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json.error || (json.details ? json.details.join(', ') : 'Network request failed');
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return handleResponse(res);
}

export async function fetchIncidents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);

  const url = `${API_BASE}/incidents?${params.toString()}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchIncidentById(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  return handleResponse(res);
}

export async function createIncident(data) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function verifyIncident(id, notes = '', actor = 'Emergency Coordinator') {
  const res = await fetch(`${API_BASE}/incidents/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verification_notes: notes, actor }),
  });
  return handleResponse(res);
}

export async function dispatchIncident(id, unitId, notes = '', actor = 'Emergency Coordinator') {
  const res = await fetch(`${API_BASE}/incidents/${id}/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unit_id: unitId, notes, actor }),
  });
  return handleResponse(res);
}

export async function respondIncident(id, notes = '', actor = 'Response Unit') {
  const res = await fetch(`${API_BASE}/incidents/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, actor }),
  });
  return handleResponse(res);
}

export async function resolveIncident(id, resolutionNotes = '', actor = 'Emergency Coordinator') {
  const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution_notes: resolutionNotes, actor }),
  });
  return handleResponse(res);
}

export async function attemptArbitraryTransition(id, targetStatus) {
  const res = await fetch(`${API_BASE}/incidents/${id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_status: targetStatus }),
  });
  return handleResponse(res);
}

export async function fetchIncidentEvents(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}/events`);
  return handleResponse(res);
}

export async function fetchResponseUnits(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);

  const res = await fetch(`${API_BASE}/response-units?${params.toString()}`);
  return handleResponse(res);
}

export async function resetDemoDatabase() {
  const res = await fetch(`${API_BASE}/system/reset-demo`, {
    method: 'POST',
  });
  return handleResponse(res);
}

export async function fetchAcademicSpec() {
  const res = await fetch(`${API_BASE}/system/spec`);
  return handleResponse(res);
}
