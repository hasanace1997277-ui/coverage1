import { FlightTimingRecord } from '../types/flight';

/**
 * Normalizes input time into standard HH:mm (24h)
 * Handles: "830" -> "08:30", "0830" -> "08:30", "8:30" -> "08:30", "14:20" -> "14:20"
 */
export function normalizeTimeString(input: string | undefined | null): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Already HH:mm
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(trimmed)) {
    const parts = trimmed.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
  }

  // 3 or 4 digits like "830" or "0830" or "1430"
  if (/^\d{3,4}$/.test(trimmed)) {
    const padded = trimmed.padStart(4, '0');
    const hh = parseInt(padded.slice(0, 2), 10);
    const mm = parseInt(padded.slice(2, 4), 10);
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
      return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
    }
  }

  return trimmed;
}

/**
 * Gets current local time in HH:mm format
 */
export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Gets default date string in format "DD-MMM-YY-DAY" (e.g., "01-NOV-26-SUN")
 */
export function getDefaultDateString(): string {
  const now = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const dd = String(now.getDate()).padStart(2, '0');
  const mmm = months[now.getMonth()];
  const yy = String(now.getFullYear()).slice(-2);
  const day = days[now.getDay()];
  
  return `${dd}-${mmm}-${yy}-${day}`;
}

/**
 * Sanitizes and enriches a record with ID and timestamps
 */
export function sanitizeFlightRecord(raw: Partial<FlightTimingRecord>): FlightTimingRecord {
  return {
    id: raw.id || `flt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: (raw.date || getDefaultDateString()).toUpperCase().trim(),
    flight: (raw.flight || '').toUpperCase().trim(),
    sta: normalizeTimeString(raw.sta || ''),
    std: normalizeTimeString(raw.std || ''),
    ata: normalizeTimeString(raw.ata || ''),
    atd: normalizeTimeString(raw.atd || ''),
    coverageMan: (raw.coverageMan || '').trim(),
    coverageId: (raw.coverageId || '').trim(),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
