/**
 * ERCS Constants and Helpers
 * Roll No: 124BTCS1031 | SEP Micro Project
 */

export const INCIDENT_STATUSES = [
  'REPORTED',
  'VERIFIED',
  'DISPATCHED',
  'RESPONDING',
  'RESOLVED',
];

export const VALID_TRANSITIONS = {
  REPORTED: ['VERIFIED'],
  VERIFIED: ['DISPATCHED'],
  DISPATCHED: ['RESPONDING'],
  RESPONDING: ['RESOLVED'],
  RESOLVED: [],
};

export const EMERGENCY_TYPES = [
  'Fire',
  'Medical',
  'Accident',
  'Security',
  'Natural Disaster',
];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const ACTORS = [
  'Emergency Reporter',
  'Emergency Coordinator',
  'Response Unit',
];

export const STATUS_COLORS = {
  REPORTED: {
    bg: '#fef3c7',
    text: '#92400e',
    border: '#fde68a',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: '#d97706',
  },
  VERIFIED: {
    bg: '#ede9fe',
    text: '#5b21b6',
    border: '#ddd6fe',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    dot: '#7c3aed',
  },
  DISPATCHED: {
    bg: '#dbeafe',
    text: '#1e40af',
    border: '#bfdbfe',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: '#2563eb',
  },
  RESPONDING: {
    bg: '#ffedd5',
    text: '#9a3412',
    border: '#fed7aa',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    dot: '#ea580c',
  },
  RESOLVED: {
    bg: '#d1fae5',
    text: '#065f46',
    border: '#a7f3d0',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: '#10b981',
  },
};

export const PRIORITY_COLORS = {
  LOW: {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
  },
  MEDIUM: {
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd',
  },
  HIGH: {
    bg: '#ffedd5',
    text: '#c2410c',
    border: '#fed7aa',
  },
  CRITICAL: {
    bg: '#fee2e2',
    text: '#b91c1c',
    border: '#fca5a5',
  },
};

export const UNIT_STATUS_COLORS = {
  AVAILABLE: {
    bg: '#d1fae5',
    text: '#065f46',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  ASSIGNED: {
    bg: '#dbeafe',
    text: '#1e40af',
    badge: 'bg-blue-100 text-blue-800',
  },
  BUSY: {
    bg: '#fee2e2',
    text: '#991b1b',
    badge: 'bg-rose-100 text-rose-800',
  },
};
