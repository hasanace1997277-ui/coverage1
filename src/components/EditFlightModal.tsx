import React, { useState, useEffect } from 'react';
import { X, Clock, Plane, Calendar, User, Save } from 'lucide-react';
import { FlightTimingRecord } from '../types/flight';
import { getCurrentTimeHHMM, normalizeTimeString } from '../utils/flightCalculations';

interface EditFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: FlightTimingRecord | null;
  onSave: (id: string, updates: Partial<FlightTimingRecord>) => void;
}

export const EditFlightModal: React.FC<EditFlightModalProps> = ({
  isOpen,
  onClose,
  flight,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [sta, setSta] = useState('');
  const [std, setStd] = useState('');
  const [ata, setAta] = useState('');
  const [atd, setAtd] = useState('');
  const [coverageMan, setCoverageMan] = useState('');
  const [coverageId, setCoverageId] = useState('');

  useEffect(() => {
    if (flight) {
      setDate(flight.date || '');
      setFlightNumber(flight.flight || '');
      setSta(flight.sta || '');
      setStd(flight.std || '');
      setAta(flight.ata || '');
      setAtd(flight.atd || '');
      setCoverageMan(flight.coverageMan || '');
      setCoverageId(flight.coverageId || '');
    }
  }, [flight, isOpen]);

  if (!isOpen || !flight) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(flight.id, {
      date: date.trim(),
      flight: flightNumber.toUpperCase().trim(),
      sta: normalizeTimeString(sta),
      std: normalizeTimeString(std),
      ata: normalizeTimeString(ata),
      atd: normalizeTimeString(atd),
      coverageMan: coverageMan.trim(),
      coverageId: coverageId.trim(),
    });
    onClose();
  };

  const stampAta = () => {
    setAta(getCurrentTimeHHMM());
  };

  const stampAtd = () => {
    setAtd(getCurrentTimeHHMM());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Mobile drag affordance */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-700"></div>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Edit Flight {flight.flight}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Date & Flight Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Date
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Flight Number
              </label>
              <input
                type="text"
                required
                value={flightNumber}
                onChange={e => setFlightNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Coverage Man Name & ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Coverage Man's Name
              </label>
              <input
                type="text"
                value={coverageMan}
                onChange={e => setCoverageMan(e.target.value)}
                placeholder="e.g. Md. Hasan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Coverage Man ID
              </label>
              <input
                type="text"
                value={coverageId}
                onChange={e => setCoverageId(e.target.value)}
                placeholder="e.g. CGP-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Scheduled Timings */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Scheduled Timings (STA / STD)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">STA (Arrival)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={sta}
                  onChange={e => setSta(e.target.value)}
                  onBlur={e => setSta(normalizeTimeString(e.target.value))}
                  placeholder="HH:mm"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-white focus:border-sky-500 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">STD (Departure)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={std}
                  onChange={e => setStd(e.target.value)}
                  onBlur={e => setStd(normalizeTimeString(e.target.value))}
                  placeholder="HH:mm"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-white focus:border-sky-500 focus:outline-none tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Actual Timings with 1-Tap 'NOW' Stamps */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2.5">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase">
              Actual Timings (ATA / ATD)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">ATA (Actual Arr)</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={5}
                    value={ata}
                    onChange={e => setAta(e.target.value)}
                    onBlur={e => setAta(normalizeTimeString(e.target.value))}
                    placeholder="HH:mm"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={stampAta}
                    className="px-2 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                  >
                    NOW
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">ATD (Actual Dep)</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={5}
                    value={atd}
                    onChange={e => setAtd(e.target.value)}
                    onBlur={e => setAtd(normalizeTimeString(e.target.value))}
                    placeholder="HH:mm"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={stampAtd}
                    className="px-2 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                  >
                    NOW
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 bg-sky-600 hover:bg-sky-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes to Server</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
