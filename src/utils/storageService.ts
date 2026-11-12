import { FlightTimingRecord } from '../types/flight';
import { sanitizeFlightRecord } from './flightCalculations';

const STORAGE_KEY_FLIGHTS = 'aerotimer_server_flights';
const STORAGE_KEY_ADMIN_PWD = 'aerotimer_admin_password';
const DEFAULT_PASSWORD = 'cgppfaapt';

const INITIAL_SEED_FLIGHTS: Partial<FlightTimingRecord>[] = [
  {
    date: '01-NOV-26-SUN',
    flight: 'BG615/BG616',
    sta: '08:15',
    std: '09:30',
    ata: '08:10',
    atd: '09:35',
    coverageMan: 'Hasan',
    coverageId: 'CGP-01',
  },
  {
    date: '01-NOV-26-SUN',
    flight: 'BG135/BG135',
    sta: '10:45',
    std: '12:00',
    ata: '10:55',
    atd: '12:05',
    coverageMan: 'Hasan',
    coverageId: 'CGP-01',
  },
  {
    date: '01-NOV-26-SUN',
    flight: 'BG127/BG127',
    sta: '13:20',
    std: '14:35',
    ata: '13:20',
    atd: '14:30',
    coverageMan: 'Rafiq',
    coverageId: 'CGP-04',
  },
  {
    date: '01-NOV-26-SUN',
    flight: 'BG617/BG618',
    sta: '16:00',
    std: '17:15',
    ata: '16:25',
    atd: '17:50',
    coverageMan: 'Tareq',
    coverageId: 'CGP-08',
  },
];

let serverAvailable: boolean | null = null;

// Test if server API exists
export async function isServerAvailable(): Promise<boolean> {
  if (serverAvailable !== null) return serverAvailable;
  try {
    const res = await fetch('/api/health');
    const isJson = res.headers.get('content-type')?.includes('application/json');
    serverAvailable = res.ok && !!isJson;
  } catch {
    serverAvailable = false;
  }
  return serverAvailable;
}

// Local storage fallback helpers
function getLocalFlights(): FlightTimingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FLIGHTS);
    if (!raw) {
      const seeded = INITIAL_SEED_FLIGHTS.map(f => sanitizeFlightRecord(f));
      localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(f => sanitizeFlightRecord(f)) : [];
  } catch {
    return INITIAL_SEED_FLIGHTS.map(f => sanitizeFlightRecord(f));
  }
}

function saveLocalFlights(flights: FlightTimingRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(flights));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

function getLocalPassword(): string {
  return localStorage.getItem(STORAGE_KEY_ADMIN_PWD) || DEFAULT_PASSWORD;
}

function setLocalPassword(pwd: string) {
  localStorage.setItem(STORAGE_KEY_ADMIN_PWD, pwd);
}

// Unified API / Storage methods
export async function fetchAllFlights(): Promise<{ flights: FlightTimingRecord[]; mode: 'server' | 'local' }> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch('/api/flights');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return { flights: json.data, mode: 'server' };
        }
      }
    } catch (err) {
      console.warn('Server fetch error, falling back to local storage', err);
    }
  }

  // Fallback for GitHub Pages or static host
  const local = getLocalFlights();
  return { flights: local, mode: 'local' };
}

export async function createFlightRecord(flightData: Partial<FlightTimingRecord>): Promise<FlightTimingRecord> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Server save failed, using local storage', err);
    }
  }

  // Fallback
  const newFlight = sanitizeFlightRecord(flightData);
  const existing = getLocalFlights();
  const updated = [newFlight, ...existing];
  saveLocalFlights(updated);
  return newFlight;
}

export async function updateFlightRecord(id: string, updates: Partial<FlightTimingRecord>): Promise<FlightTimingRecord> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch(`/api/flights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Server update failed, using local storage', err);
    }
  }

  // Fallback
  const existing = getLocalFlights();
  let updatedRecord: FlightTimingRecord | null = null;
  const updated = existing.map(f => {
    if (f.id === id) {
      updatedRecord = sanitizeFlightRecord({ ...f, ...updates, id, updatedAt: new Date().toISOString() });
      return updatedRecord;
    }
    return f;
  });
  saveLocalFlights(updated);
  return updatedRecord || sanitizeFlightRecord({ ...updates, id });
}

export async function deleteFlightRecord(id: string): Promise<boolean> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch(`/api/flights/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Server delete failed, using local storage', err);
    }
  }

  const existing = getLocalFlights();
  const filtered = existing.filter(f => f.id !== id);
  saveLocalFlights(filtered);
  return true;
}

export async function resetFlights(mode: 'blank' | 'initial'): Promise<FlightTimingRecord[]> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch(`/api/flights/reset?mode=${mode}`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Server reset failed, using local storage', err);
    }
  }

  let resetSet: FlightTimingRecord[];
  if (mode === 'blank') {
    resetSet = [
      sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG615/BG616', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
      sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG135/BG135', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
      sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG127/BG127', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
      sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG617/BG618', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
    ];
  } else {
    resetSet = INITIAL_SEED_FLIGHTS.map(f => sanitizeFlightRecord(f));
  }
  saveLocalFlights(resetSet);
  return resetSet;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        return !!json.success;
      }
    } catch (err) {
      console.warn('Server auth check failed, falling back to local password', err);
    }
  }

  // Local fallback (defaults to cgppfaapt)
  const localPwd = getLocalPassword();
  return password.trim() === localPwd.trim();
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const hasServer = await isServerAvailable();
  if (hasServer) {
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (isJson) {
        const json = await res.json();
        if (res.ok && json.success) {
          setLocalPassword(newPassword.trim());
          return { success: true };
        }
        return { success: false, error: json.error || 'Server rejected password update' };
      }
    } catch (err) {
      console.warn('Server password update failed, using local storage', err);
    }
  }

  // Local fallback
  const localPwd = getLocalPassword();
  if (currentPassword.trim() !== localPwd.trim()) {
    return { success: false, error: 'Current password is incorrect' };
  }
  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, error: 'New password must be at least 4 characters' };
  }
  setLocalPassword(newPassword.trim());
  return { success: true };
}

export function downloadFlightsCsv(flights: FlightTimingRecord[]) {
  const headers = ['DATE', 'FLIGHT', 'STA', 'STD', 'ATA', 'ATD', 'COVERAGE_MAN_NAME', 'COVERAGE_MAN_ID', 'RECORDED_AT'];
  const rows = flights.map(f => [
    `"${f.date || ''}"`,
    `"${f.flight || ''}"`,
    `"${f.sta || ''}"`,
    `"${f.std || ''}"`,
    `"${f.ata || ''}"`,
    `"${f.atd || ''}"`,
    `"${(f.coverageMan || '').replace(/"/g, '""')}"`,
    `"${(f.coverageId || '').replace(/"/g, '""')}"`,
    `"${f.updatedAt || f.createdAt || ''}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'flight_coverage_timings.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
