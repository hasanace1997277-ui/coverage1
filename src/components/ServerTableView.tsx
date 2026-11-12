import React, { useState } from 'react';
import { Download, RotateCcw, Server, KeyRound, LogOut, Search, Trash2, Edit2, ShieldCheck } from 'lucide-react';
import { FlightTimingRecord } from '../types/flight';
import { ChangePasswordModal } from './ChangePasswordModal';

interface ServerTableViewProps {
  flights: FlightTimingRecord[];
  onResetData: (mode: 'blank' | 'initial') => void;
  onExportCsv: () => void;
  onOpenEditModal: (flight: FlightTimingRecord) => void;
  onDeleteFlight: (id: string) => void;
  onExitServer: () => void;
}

export const ServerTableView: React.FC<ServerTableViewProps> = ({
  flights,
  onResetData,
  onExportCsv,
  onOpenEditModal,
  onDeleteFlight,
  onExitServer,
}) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlights = flights.filter(f => {
    const q = searchQuery.toLowerCase();
    return (
      f.flight.toLowerCase().includes(q) ||
      f.date.toLowerCase().includes(q) ||
      (f.coverageMan && f.coverageMan.toLowerCase().includes(q)) ||
      (f.coverageId && f.coverageId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Admin Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              <span>Server Master Table</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as Station Administrator · {flights.length} total flight records
          </p>
        </div>

        {/* Admin Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 hover:text-white transition-colors"
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
            <span>Change Password</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onExitServer}
            title="Log out of server and return to main portal"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 hover:border-rose-800/80 rounded-xl text-xs font-medium text-slate-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Exit Server</span>
          </button>
        </div>
      </div>

      {/* Search & Reset Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search flight, date, or coverage man..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => onResetData('initial')}
          className="self-end sm:self-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Demo Defaults</span>
        </button>
      </div>

      {/* Master Server Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold tracking-wider uppercase text-[11px]">
                <th className="px-4 py-3">DATE</th>
                <th className="px-4 py-3">FLIGHT</th>
                <th className="px-3 py-3 text-center">STA</th>
                <th className="px-3 py-3 text-center">STD</th>
                <th className="px-3 py-3 text-center">ATA</th>
                <th className="px-3 py-3 text-center">ATD</th>
                <th className="px-4 py-3">COVERAGE MAN</th>
                <th className="px-3 py-3 text-center">ID</th>
                <th className="px-3 py-3 text-right font-sans">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFlights.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500 font-sans text-xs">
                    {searchQuery ? 'No records match your search.' : 'No flight timing records in the server table.'}
                  </td>
                </tr>
              ) : (
                filteredFlights.map(f => (
                  <tr key={f.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-slate-200 font-semibold">{f.date}</td>
                    <td className="px-4 py-3 font-bold text-white tracking-wide">{f.flight}</td>
                    <td className="px-3 py-3 text-center tabular-nums text-slate-300">
                      {f.sta || '--:--'}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-slate-300">
                      {f.std || '--:--'}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums font-bold text-emerald-400">
                      {f.ata || '--:--'}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums font-bold text-emerald-400">
                      {f.atd || '--:--'}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-200 font-medium">
                      {f.coverageMan || 'Unassigned'}
                    </td>
                    <td className="px-3 py-3 text-center text-sky-400 font-bold">
                      {f.coverageId || '--'}
                    </td>
                    <td className="px-3 py-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenEditModal(f)}
                          className="p-1 text-slate-400 hover:text-sky-400 rounded"
                          title="Edit timings"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFlight(f.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Delete flight"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-slate-800 bg-slate-900/60 px-4 py-3 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>Showing {filteredFlights.length} of {flights.length} flights</span>
          <span>Stored on server at /data/flight_records.json</span>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordChanged={() => {}}
      />
    </div>
  );
};
