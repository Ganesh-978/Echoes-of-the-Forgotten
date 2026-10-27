import React from 'react';
import { Terminal, Archive, BookOpen, Monitor, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'archive' | 'terminal' | 'memory';
  onNavigate: (view: 'home' | 'archive' | 'terminal' | 'memory') => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  crtEnabled,
  onToggleCrt,
}) => {
  return (
    <header className="border-b border-terminal-border bg-terminal-bg/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-none focus:ring-1 focus:ring-terminal-green/50 rounded p-1 transition-transform active:scale-95"
          aria-label="Return to Echoes of the Forgotten homepage"
        >
          <div className="w-10 h-10 rounded border border-terminal-green/60 bg-terminal-surface flex items-center justify-center shadow-phosphor-green">
            <Terminal className="w-5 h-5 text-terminal-green animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl tracking-widest text-terminal-green text-glow-green font-bold">
                ECHOES OF THE FORGOTTEN
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-terminal-muted/40 border border-terminal-muted text-terminal-amber font-semibold">
                v1.0 • 2026
              </span>
            </div>
            <p className="text-xs text-terminal-muted font-mono tracking-wide">
              The Digital Archaeology of Lost Computing
            </p>
          </div>
        </button>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main Navigation">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              currentView === 'home'
                ? 'bg-terminal-green/15 text-terminal-green border border-terminal-green/40 shadow-phosphor-green'
                : 'text-terminal-text/70 hover:text-terminal-green hover:bg-terminal-surface/60 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onNavigate('archive')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              currentView === 'archive'
                ? 'bg-terminal-green/15 text-terminal-green border border-terminal-green/40 shadow-phosphor-green'
                : 'text-terminal-text/70 hover:text-terminal-green hover:bg-terminal-surface/60 border border-transparent'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>

          <button
            onClick={() => onNavigate('terminal')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              currentView === 'terminal'
                ? 'bg-terminal-green/15 text-terminal-green border border-terminal-green/40 shadow-phosphor-green'
                : 'text-terminal-text/70 hover:text-terminal-green hover:bg-terminal-surface/60 border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => onNavigate('memory')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              currentView === 'memory'
                ? 'bg-terminal-green/15 text-terminal-green border border-terminal-green/40 shadow-phosphor-green'
                : 'text-terminal-text/70 hover:text-terminal-green hover:bg-terminal-surface/60 border border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Memory Vault</span>
          </button>

          {/* CRT Effect Toggle */}
          <button
            onClick={onToggleCrt}
            title={crtEnabled ? 'Disable CRT Scanlines (Accessibility)' : 'Enable CRT Scanlines'}
            className={`ml-2 p-1.5 rounded border text-xs flex items-center gap-1 transition-all ${
              crtEnabled
                ? 'border-terminal-amber text-terminal-amber bg-terminal-amber/10'
                : 'border-terminal-muted/40 text-terminal-muted hover:text-terminal-text hover:border-terminal-border'
            }`}
            aria-pressed={crtEnabled}
            aria-label="Toggle CRT Scanline Effect"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline font-mono text-[11px]">
              CRT: {crtEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
