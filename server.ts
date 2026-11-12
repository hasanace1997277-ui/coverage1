import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sanitizeFlightRecord } from './src/utils/flightCalculations.ts';
import { FlightTimingRecord } from './src/types/flight.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'flight_records.json');
const CONFIG_FILE = path.join(DATA_DIR, 'server_config.json');

const DEFAULT_ADMIN_PASSWORD = 'cgppfaapt';

interface ServerConfig {
  adminPassword: string;
  updatedAt: string;
}

function readConfig(): ServerConfig {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONFIG_FILE)) {
      const initialConfig: ServerConfig = {
        adminPassword: DEFAULT_ADMIN_PASSWORD,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2), 'utf-8');
      return initialConfig;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.adminPassword) {
      parsed.adminPassword = DEFAULT_ADMIN_PASSWORD;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading server config, falling back to default password:', err);
    return { adminPassword: DEFAULT_ADMIN_PASSWORD, updatedAt: new Date().toISOString() };
  }
}

function writeConfig(config: ServerConfig) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

const INITIAL_FLIGHTS: Partial<FlightTimingRecord>[] = [
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

function readFlights(): FlightTimingRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const seeded = INITIAL_FLIGHTS.map(f => sanitizeFlightRecord(f));
      fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed: FlightTimingRecord[] = JSON.parse(raw);
    return parsed.map(f => sanitizeFlightRecord(f));
  } catch (error) {
    console.error('Error reading flight records file:', error);
    return INITIAL_FLIGHTS.map(f => sanitizeFlightRecord(f));
  }
}

function writeFlights(flights: FlightTimingRecord[]): FlightTimingRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const clean = flights.map(f => sanitizeFlightRecord(f));
  fs.writeFileSync(DATA_FILE, JSON.stringify(clean, null, 2), 'utf-8');
  return clean;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Admin login check
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    const config = readConfig();
    if (password && password.trim() === config.adminPassword.trim()) {
      res.json({ success: true, message: 'Authenticated' });
    } else {
      res.status(401).json({ success: false, error: 'Incorrect administrator password' });
    }
  });

  // Admin change password
  app.post('/api/admin/change-password', (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const config = readConfig();

    if (!currentPassword || currentPassword.trim() !== config.adminPassword.trim()) {
      res.status(401).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    if (!newPassword || newPassword.trim().length < 4) {
      res.status(400).json({ success: false, error: 'New password must be at least 4 characters' });
      return;
    }

    config.adminPassword = newPassword.trim();
    config.updatedAt = new Date().toISOString();
    writeConfig(config);

    res.json({ success: true, message: 'Administrator password updated successfully' });
  });

  // Get all flights table from server
  app.get('/api/flights', (_req: Request, res: Response) => {
    const flights = readFlights();
    res.json({
      success: true,
      data: flights,
      total: flights.length,
      lastUpdated: new Date().toISOString(),
    });
  });

  // Coverage man records a new flight
  app.post('/api/flights', (req: Request, res: Response) => {
    const flights = readFlights();
    const newFlight = sanitizeFlightRecord(req.body);
    flights.unshift(newFlight); // Most recent on top
    writeFlights(flights);
    res.status(201).json({ success: true, data: newFlight });
  });

  // Update existing flight timings
  app.put('/api/flights/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const flights = readFlights();
    const index = flights.findIndex(f => f.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Flight record not found' });
      return;
    }
    const updated = sanitizeFlightRecord({
      ...flights[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    });
    flights[index] = updated;
    writeFlights(flights);
    res.json({ success: true, data: updated });
  });

  // Delete flight
  app.delete('/api/flights/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const flights = readFlights();
    const filtered = flights.filter(f => f.id !== id);
    writeFlights(filtered);
    res.json({ success: true, deletedId: id });
  });

  // Reset template
  app.post('/api/flights/reset', (req: Request, res: Response) => {
    const mode = req.query.mode;
    let newSet: FlightTimingRecord[];
    if (mode === 'blank') {
      newSet = [
        sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG615/BG616', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
        sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG135/BG135', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
        sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG127/BG127', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
        sanitizeFlightRecord({ date: '01-NOV-26-SUN', flight: 'BG617/BG618', sta: '', std: '', ata: '', atd: '', coverageMan: '', coverageId: '' }),
      ];
    } else {
      newSet = INITIAL_FLIGHTS.map(f => sanitizeFlightRecord(f));
    }
    writeFlights(newSet);
    res.json({ success: true, data: newSet });
  });

  // CSV Export for server table
  app.get('/api/flights/export.csv', (_req: Request, res: Response) => {
    const flights = readFlights();
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
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="flight_coverage_timings.csv"');
    res.send(csv);
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
