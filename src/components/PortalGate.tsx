import React, { useState } from 'react';
import { Smartphone, Server, Plane, Lock, User, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface PortalGateProps {
  onSelectCoverage: (name: string, id: string) => void;
  onSelectServer: (password: string) => Promise<boolean>;
  initialName?: string;
  initialId?: string;
}

export const PortalGate: React.FC<PortalGateProps> = ({
  onSelectCoverage,
  onSelectServer,
  initialName = '',
  initialId = '',
}) => {
  const [activeStep, setActiveStep] = useState<'CHOICE' | 'COVERAGE_FORM' | 'SERVER_FORM'>('CHOICE');
  const [coverageName, setCoverageName] = useState(initialName || '');
  const [coverageId, setCoverageId] = useState(initialId || '');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCoverageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverageName.trim() || !coverageId.trim()) return;
    onSelectCoverage(coverageName.trim(), coverageId.trim());
  };

  const handleServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setIsVerifying(true);
    try {
      const ok = await onSelectServer(password);
      if (!ok) {
        setPasswordError('Incorrect administrator password');
      }
    } catch {
      setPasswordError('Server connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 mb-3 shadow-lg shadow-sky-500/5">
          <Plane className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight font-sans">
          AeroTimer
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Flight Ground Coverage &amp; Server System
        </p>
      </div>

      {/* Main Choice Card */}
      {activeStep === 'CHOICE' && (
        <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">
            Select Access Mode
          </div>

          {/* Option 1: Enter Coverage */}
          <button
            onClick={() => setActiveStep('COVERAGE_FORM')}
            className="w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-sky-500/50 active:scale-[0.99] transition-all shadow-xl group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Enter Coverage
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For coverage men to log flight turnaround timings on mobile
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </button>

          {/* Option 2: Enter Server */}
          <button
            onClick={() => setActiveStep('SERVER_FORM')}
            className="w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-emerald-500/50 active:scale-[0.99] transition-all shadow-xl group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Enter Server
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For administrators to view, manage &amp; export the master table
                  </p>
                </div>
              </div>
              <Lock className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
            </div>
          </button>
        </div>
      )}

      {/* Coverage Man Login Form */}
      {activeStep === 'COVERAGE_FORM' && (
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Enter Coverage</h2>
                <p className="text-[11px] text-slate-400">Identification details for logging timings</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep('CHOICE')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleCoverageSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Coverage Man's Name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={coverageName}
                onChange={e => setCoverageName(e.target.value)}
                placeholder="e.g. Md. Hasan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Coverage Man's ID
              </label>
              <input
                type="text"
                required
                value={coverageId}
                onChange={e => setCoverageId(e.target.value)}
                placeholder="e.g. CGP-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm font-mono text-white uppercase focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!coverageName.trim() || !coverageId.trim()}
              className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              <span>Continue to Recording</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Server Administrator Password Form */}
      {activeStep === 'SERVER_FORM' && (
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Enter Server</h2>
                <p className="text-[11px] text-slate-400">Administrator access required</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep('CHOICE')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleServerSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Administrator Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter administrator password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              {passwordError && (
                <div className="text-xs text-rose-400 mt-1.5 font-medium">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Default Password
              </div>
              <p>
                The default password is <code className="text-emerald-400 font-mono font-bold bg-slate-900 px-1 py-0.5 rounded">cgppfaapt</code>. You can change this anytime after logging into the server.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !password}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              <span>{isVerifying ? 'Verifying Password...' : 'Login to Server'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
