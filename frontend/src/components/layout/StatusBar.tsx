import React from 'react';
import { ShieldCheck, Wifi, WifiOff, Cpu } from 'lucide-react';
import { HealthResponse } from '../../types';

interface StatusBarProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ health, loading, error }) => {
  if (loading) {
    return (
      <aside aria-label="System status" className="bg-terminal-surface/80 border-b border-terminal-border px-4 py-1.5 text-xs font-mono text-terminal-muted flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terminal-amber animate-ping" />
          Probing archive telemetry...
        </span>
      </aside>
    );
  }

  if (error || !health) {
    return (
      <aside aria-label="System status" className="bg-red-950/40 border-b border-red-800/40 px-4 py-1.5 text-xs font-mono text-red-300 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-red-400" />
          Backend API disconnected. Ensure backend server is running on port 8000.
        </span>
      </aside>
    );
  }

  const isOnline = health.ai_status.mode === 'online';

  return (
    <aside aria-label="System status" className="bg-terminal-surface/70 border-b border-terminal-border px-4 py-1.5 text-[11px] font-mono text-terminal-text/80 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        {/* Core Connection */}
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
          <span className="text-terminal-green">Archive Core: OK</span>
        </span>

        {/* AI Engine Status */}
        <span className="flex items-center gap-1.5 border-l border-terminal-border pl-4">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-terminal-green" />
              <span>
                AI Engine: <strong className="text-terminal-green">ONLINE</strong> ({health.ai_status.model})
              </span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-terminal-amber" />
              <span className="text-terminal-amber">
                AI Mode: <strong>OFFLINE ARCHIVE SYNTHESIS</strong> (Zero-Cost / No API Key Required)
              </span>
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3 text-terminal-muted">
        <span className="hidden sm:flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-terminal-green" />
          <span>Local BM25 Grounding Active</span>
        </span>
        <span className="border-l border-terminal-border pl-3 text-[10px]">
          {health.environment.toUpperCase()}
        </span>
      </div>
    </aside>
  );
};
