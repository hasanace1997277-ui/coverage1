import React, { useState } from 'react';
import {
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Plane,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  Save,
  Check
} from 'lucide-react';
import { FlightTimingRecord } from '../types/flight';
import { getCurrentTimeHHMM, getDefaultDateString, normalizeTimeString } from '../utils/flightCalculations';

interface MobileFlightRecorderProps {
  flights: FlightTimingRecord[];
  coverageMan: string;
  coverageId: string;
  onCoverageManChange: (name: string, id: string) => void;
  onSaveNewFlight: (flight: Partial<FlightTimingRecord>) => Promise<void>;
  onUpdateFlight: (id: string, updates: Partial<FlightTimingRecord>) => void;
  onDeleteFlight: (id: string) => void;
  onOpenEditModal: (flight: FlightTimingRecord) => void;
  isSaving: boolean;
}

const COMMON_FLIGHT_SHORTCUTS = ['BG615/BG616', 'BG135/BG135', 'BG127/BG127', 'BG617/BG618'];

export const MobileFlightRecorder: React.FC<MobileFlightRecorderProps> = ({
  flights,
  coverageMan,
  coverageId,
  onCoverageManChange,
  onSaveNewFlight,
  onUpdateFlight,
  onDeleteFlight,
  onOpenEditModal,
  isSaving,
}) => {
  // New flight form state
  const [date, setDate] = useState(getDefaultDateString());
  const [flight, setFlight] = useState('');
  const [sta, setSta] = useState('');
  const [std, setStd] = useState('');
  const [ata, setAta] = useState('');
  const [atd, setAtd] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);

  // Quick stamps for the form
  const stampFormAta = () => {
    setAta(getCurrentTimeHHMM());
  };

  const stampFormAtd = () => {
    setAtd(getCurrentTimeHHMM());
  };

  // Quick stamp directly on existing flight card
  const stampCardTiming = (id: string, field: 'ata' | 'atd') => {
    const timeNow = getCurrentTimeHHMM();
    onUpdateFlight(id, { [field]: timeNow });
    setRecentlySavedId(id);
    setTimeout(() => setRecentlySavedId(null), 2500);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight.trim()) return;

    await onSaveNewFlight({
      date: date.trim() || getDefaultDateString(),
      flight: flight.toUpperCase().trim(),
      sta: normalizeTimeString(sta),
      std: normalizeTimeString(std),
      ata: normalizeTimeString(ata),
      atd: normalizeTimeString(atd),
      coverageMan: coverageMan.trim() || 'Coverage Officer',
      coverageId: coverageId.trim() || '',
    });

    // Reset timings for next entry, preserve date & coverage man
    setFlight('');
    setSta('');
    setStd('');
    setAta('');
    setAtd('');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Coverage Man Identity Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Logged in Coverage Officer
              </div>
              <div className="text-sm font-bold text-white truncate">
                {coverageMan || 'Coverage Officer'}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
              ID: {coverageId || '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Form: Record Single Flight */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        {/* Card Header */}
        <div
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          className="flex items-center justify-between px-4 py-3.5 bg-slate-950/80 cursor-pointer select-none border-b border-slate-800/80"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Record New Flight Timings</h2>
          </div>
          <span className="text-xs text-sky-400 font-medium">
            {isFormExpanded ? 'Collapse' : 'Tap to Record'}
          </span>
        </div>

        {isFormExpanded && (
          <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
            {/* Row 1: Date & Flight Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  DATE
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    placeholder="01-NOV-26-SUN"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white uppercase focus:border-sky-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  FLIGHT NUMBER
                </label>
                <div className="relative">
                  <Plane className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={flight}
                    onChange={e => setFlight(e.target.value.toUpperCase())}
                    placeholder="e.g. BG615/BG616"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white uppercase focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Flight Shortcut Chips */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5">Quick Select Flight:</div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_FLIGHT_SHORTCUTS.map(sc => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setFlight(sc)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                      flight === sc
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduled Timings (STA & STD) */}
            <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Scheduled Timings (STA / STD)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    STA (Sched Arrival)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={sta}
                    onChange={e => setSta(e.target.value)}
                    onBlur={e => setSta(normalizeTimeString(e.target.value))}
                    placeholder="HH:mm"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-center text-xs font-mono font-bold text-white focus:border-sky-500 focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    STD (Sched Departure)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={std}
                    onChange={e => setStd(e.target.value)}
                    onBlur={e => setStd(normalizeTimeString(e.target.value))}
                    placeholder="HH:mm"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-center text-xs font-mono font-bold text-white focus:border-sky-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Actual Timings (ATA & ATD) with 1-Tap 'NOW' Stamps */}
            <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3 space-y-2.5">
              <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  Actual Timings (ATA / ATD)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Tap NOW button to fill</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* ATA Box */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-slate-400">
                    ATA (Actual Arrival)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      maxLength={5}
                      value={ata}
                      onChange={e => setAta(e.target.value)}
                      onBlur={e => setAta(normalizeTimeString(e.target.value))}
                      placeholder="HH:mm"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-center text-xs font-mono font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={stampFormAta}
                      className="px-2.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold shrink-0 transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      NOW
                    </button>
                  </div>
                </div>

                {/* ATD Box */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-slate-400">
                    ATD (Actual Departure)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      maxLength={5}
                      value={atd}
                      onChange={e => setAtd(e.target.value)}
                      onBlur={e => setAtd(normalizeTimeString(e.target.value))}
                      placeholder="HH:mm"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2 text-center text-xs font-mono font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={stampFormAtd}
                      className="px-2.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold shrink-0 transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Save to Server */}
            <button
              type="submit"
              disabled={isSaving || !flight.trim()}
              className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving to Server...' : 'Save Flight to Server'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Recorded Flights List (Phone Ergonomics: ZERO horizontal scrollbar!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Recorded Flights on Server</span>
            <span className="text-xs text-slate-500 font-mono">({flights.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Tap to edit timings</span>
        </div>

        {flights.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
            No flight timings recorded yet. Use the form above to record your first flight!
          </div>
        ) : (
          flights.map(flightItem => {
            const isSaved = recentlySavedId === flightItem.id;

            return (
              <div
                key={flightItem.id}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm space-y-3 transition-colors hover:border-slate-700"
              >
                {/* Header: Flight & Date & Coverage Man */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <div className="text-base font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
                      <Plane className="h-4 w-4 text-sky-400" />
                      {flightItem.flight}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {flightItem.date}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-200">
                      {flightItem.coverageMan || 'Coverage Officer'}
                    </div>
                    <div className="text-[10px] text-sky-400 font-mono">
                      {flightItem.coverageId ? `ID: ${flightItem.coverageId}` : 'Coverage Man'}
                    </div>
                  </div>
                </div>

                {/* Timings 4-Box Mobile Layout (Zero Horizontal Scroll!) */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  {/* STA */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase">STA (Sched Arr)</div>
                    <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
                      {flightItem.sta || <span className="text-slate-600 font-normal">--:--</span>}
                    </div>
                  </div>

                  {/* STD */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase">STD (Sched Dep)</div>
                    <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
                      {flightItem.std || <span className="text-slate-600 font-normal">--:--</span>}
                    </div>
                  </div>

                  {/* ATA with 1-Tap Stamp */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                      ATA (Actual Arr)
                    </div>
                    {flightItem.ata ? (
                      <div className="text-sm font-bold text-emerald-300 mt-0.5 tabular-nums">
                        {flightItem.ata}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => stampCardTiming(flightItem.id, 'ata')}
                        className="mt-1 w-full py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-bold transition-colors active:scale-95"
                      >
                        + Stamp ATA Now
                      </button>
                    )}
                  </div>

                  {/* ATD with 1-Tap Stamp */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                      ATD (Actual Dep)
                    </div>
                    {flightItem.atd ? (
                      <div className="text-sm font-bold text-emerald-300 mt-0.5 tabular-nums">
                        {flightItem.atd}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => stampCardTiming(flightItem.id, 'atd')}
                        className="mt-1 w-full py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-bold transition-colors active:scale-95"
                      >
                        + Stamp ATD Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1">
                  {isSaved ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-sans">
                      <Check className="h-3.5 w-3.5" /> Saved to server
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-sans">
                      {flightItem.atd ? 'Flight Departed' : flightItem.ata ? 'On Ground' : 'Scheduled'}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(flightItem)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors min-h-[38px]"
                    >
                      <Edit2 className="h-3 w-3 text-sky-400" />
                      <span>Edit Timings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteFlight(flightItem.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Delete flight"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
