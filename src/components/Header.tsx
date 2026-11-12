import React from 'react';
import { Plane, User, Server, LogOut } from 'lucide-react';

interface HeaderProps {
  appMode: 'coverage' | 'server';
  coverageMan: string;
  coverageId: string;
  onExitToPortal: () => void;
  flightsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  coverageMan,
  coverageId,
  onExitToPortal,
  flightsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight leading-none">
              AeroTimer
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {appMode === 'coverage' ? 'Coverage Mobile Entry' : 'Server Administration'}
            </div>
          </div>
        </div>

        {/* User / Mode Badge & Exit Portal */}
        <div className="flex items-center gap-2">
          {appMode === 'coverage' ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-xs">
              <User className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-semibold text-white">{coverageMan || 'Coverage'}</span>
              {coverageId && (
                <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-1 py-0.5 rounded">
                  {coverageId}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-xs text-emerald-300 font-semibold">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Server</span>
            </div>
          )}

          <button
            onClick={onExitToPortal}
            title="Exit to Portal (Enter Coverage or Enter Server)"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Switch</span>
          </button>
        </div>
      </div>
    </header>
  );
};
