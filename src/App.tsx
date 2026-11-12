import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PortalGate } from './components/PortalGate';
import { MobileFlightRecorder } from './components/MobileFlightRecorder';
import { ServerTableView } from './components/ServerTableView';
import { EditFlightModal } from './components/EditFlightModal';
import { FlightTimingRecord } from './types/flight';
import {
  fetchAllFlights,
  createFlightRecord,
  updateFlightRecord,
  deleteFlightRecord,
  resetFlights,
  verifyAdminPassword,
  downloadFlightsCsv
} from './utils/storageService';
import { CheckCircle2, Clock } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<'PORTAL' | 'COVERAGE' | 'SERVER'>('PORTAL');
  const [flights, setFlights] = useState<FlightTimingRecord[]>([]);
  const [storageMode, setStorageMode] = useState<'server' | 'local'>('server');
  const [coverageMan, setCoverageMan] = useState<string>(() => {
    return localStorage.getItem('aerotimer_coverage_name') || '';
  });
  const [coverageId, setCoverageId] = useState<string>(() => {
    return localStorage.getItem('aerotimer_coverage_id') || '';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightTimingRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Toast notification
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(prev => (prev === message ? null : prev));
    }, 3000);
  };

  // Load flights using unified storage service
  const loadFlights = useCallback(async () => {
    try {
      const result = await fetchAllFlights();
      setFlights(result.flights);
      setStorageMode(result.mode);
    } catch (err) {
      console.error('Failed to load flights:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  // Handle portal selection: Enter Coverage
  const handleSelectCoverage = (name: string, id: string) => {
    setCoverageMan(name);
    setCoverageId(id);
    localStorage.setItem('aerotimer_coverage_name', name);
    localStorage.setItem('aerotimer_coverage_id', id);
    setAppState('COVERAGE');
    showToast(`Welcome, ${name} (${id})`);
  };

  // Handle portal selection: Enter Server
  const handleSelectServer = async (password: string): Promise<boolean> => {
    try {
      const ok = await verifyAdminPassword(password);
      if (ok) {
        setAppState('SERVER');
        showToast('Logged into Server Master Table');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // Coverage man records a new flight
  const handleSaveNewFlight = async (flightData: Partial<FlightTimingRecord>) => {
    setIsSaving(true);
    try {
      const newRecord = await createFlightRecord({
        ...flightData,
        coverageMan: flightData.coverageMan || coverageMan,
        coverageId: flightData.coverageId || coverageId,
      });
      setFlights(prev => [newRecord, ...prev.filter(f => f.id !== newRecord.id)]);
      showToast(`Flight ${newRecord.flight} saved to server table!`);
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Error saving flight to server');
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing flight timings
  const handleUpdateFlight = async (id: string, updates: Partial<FlightTimingRecord>) => {
    setFlights(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
    );

    try {
      const updated = await updateFlightRecord(id, updates);
      setFlights(prev => prev.map(f => (f.id === id ? updated : f)));
      showToast('Timings updated on server');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  // Delete flight
  const handleDeleteFlight = async (id: string) => {
    const flightToDelete = flights.find(f => f.id === id);
    setFlights(prev => prev.filter(f => f.id !== id));
    try {
      await deleteFlightRecord(id);
      showToast(`Flight ${flightToDelete?.flight || ''} deleted`);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Reset template data
  const handleResetData = async (mode: 'blank' | 'initial') => {
    try {
      setIsLoading(true);
      const resetSet = await resetFlights(mode);
      setFlights(resetSet);
      showToast('Reset server table to initial sheet rows');
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export CSV (works both on live server and on GitHub Pages static)
  const handleExportCsv = () => {
    downloadFlightsCsv(flights);
    showToast('Downloaded flight coverage CSV');
  };

  // If at portal gate, render the opening screen
  if (appState === 'PORTAL') {
    return (
      <PortalGate
        onSelectCoverage={handleSelectCoverage}
        onSelectServer={handleSelectServer}
        initialName={coverageMan}
        initialId={coverageId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Header with user badge and exit button */}
      <Header
        appMode={appState === 'COVERAGE' ? 'coverage' : 'server'}
        coverageMan={coverageMan}
        coverageId={coverageId}
        onExitToPortal={() => setAppState('PORTAL')}
        flightsCount={flights.length}
      />

      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-sky-500/40 bg-slate-900 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-xl md:max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <Clock className="h-7 w-7 text-sky-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Loading server flight records...</p>
          </div>
        ) : appState === 'COVERAGE' ? (
          <MobileFlightRecorder
            flights={flights}
            coverageMan={coverageMan}
            coverageId={coverageId}
            onCoverageManChange={(name, id) => {
              setCoverageMan(name);
              setCoverageId(id);
              localStorage.setItem('aerotimer_coverage_name', name);
              localStorage.setItem('aerotimer_coverage_id', id);
            }}
            onSaveNewFlight={handleSaveNewFlight}
            onUpdateFlight={handleUpdateFlight}
            onDeleteFlight={handleDeleteFlight}
            onOpenEditModal={flight => {
              setEditingFlight(flight);
              setIsEditModalOpen(true);
            }}
            isSaving={isSaving}
          />
        ) : (
          <ServerTableView
            flights={flights}
            storageMode={storageMode}
            onResetData={handleResetData}
            onExportCsv={handleExportCsv}
            onOpenEditModal={flight => {
              setEditingFlight(flight);
              setIsEditModalOpen(true);
            }}
            onDeleteFlight={handleDeleteFlight}
            onExitServer={() => setAppState('PORTAL')}
          />
        )}
      </main>

      {/* Edit Flight Modal */}
      <EditFlightModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        flight={editingFlight}
        onSave={(id, updates) => handleUpdateFlight(id, updates)}
      />
    </div>
  );
}
