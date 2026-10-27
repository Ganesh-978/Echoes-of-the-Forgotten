import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { StatusBar } from './components/layout/StatusBar';
import { CrtOverlay } from './components/layout/CrtOverlay';
import { HomePage } from './pages/HomePage';
import { ArchivePage } from './pages/ArchivePage';
import { TerminalPage } from './pages/TerminalPage';
import { MemoryPage } from './pages/MemoryPage';
import { api } from './services/api';
import { HealthResponse } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'archive' | 'terminal' | 'memory'>('home');
  const [selectedTech, setSelectedTech] = useState<string>('cobol');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // CRT Scanlines state persisted in localStorage
  const [crtEnabled, setCrtEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('echoes_crt_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleCrt = () => {
    setCrtEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('echoes_crt_enabled', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoadingHealth(true);
        const data = await api.getHealth();
        setHealth(data);
        setHealthError(null);
      } catch (err: any) {
        setHealthError(err.message || 'Failed to connect to backend server');
      } finally {
        setLoadingHealth(false);
      }
    };

    fetchHealth();
    // Refresh health status periodically
    const timer = setInterval(fetchHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectTechnology = (techId: string) => {
    setSelectedTech(techId);
    setCurrentView('terminal');
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col relative selection:bg-terminal-green selection:text-terminal-bg">
      {/* CRT Scanlines and curvature */}
      <CrtOverlay enabled={crtEnabled} />

      {/* Main navigation header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        crtEnabled={crtEnabled}
        onToggleCrt={handleToggleCrt}
      />

      {/* Live System & AI telemetry bar */}
      <StatusBar health={health} loading={loadingHealth} error={healthError} />

      {/* Main view container */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && (
          <HomePage
            health={health}
            onEnterArchive={() => setCurrentView('terminal')}
            onSelectTechnology={handleSelectTechnology}
          />
        )}

        {currentView === 'archive' && (
          <ArchivePage onSelectTechnology={handleSelectTechnology} />
        )}

        {currentView === 'terminal' && (
          <TerminalPage
            initialTechnologyId={selectedTech}
            onSelectTechnology={handleSelectTechnology}
          />
        )}

        {currentView === 'memory' && (
          <MemoryPage onOpenTerminalWithTech={handleSelectTechnology} />
        )}
      </main>
    </div>
  );
};

export default App;
