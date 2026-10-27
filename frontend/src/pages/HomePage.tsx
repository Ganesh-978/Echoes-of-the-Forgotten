import React from 'react';
import { Terminal, Database, Shield, ArrowRight, Sparkles, Cpu, HelpCircle } from 'lucide-react';
import { HealthResponse } from '../types';

interface HomePageProps {
  health: HealthResponse | null;
  onEnterArchive: () => void;
  onSelectTechnology: (techId: string) => void;
}

const FEATURED_TECHNOLOGIES = [
  {
    id: 'cobol',
    name: 'COBOL',
    title: 'The Veteran of Enterprise Systems',
    era: '1959 — Present',
    badge: 'Enterprise Core',
    desc: 'Powering global banking mainframes, airline bookings, and federal infrastructure for over six decades.',
    color: 'emerald',
    tag: 'Grace Hopper & CODASYL',
  },
  {
    id: 'fortran',
    name: 'FORTRAN',
    title: 'The Ghost of Scientific Computing',
    era: '1957 — Present',
    badge: 'Formula Translation',
    desc: 'The original mathematical programming language that taught humanity how to run numerical simulations and weather models.',
    color: 'amber',
    tag: 'John Backus & IBM',
  },
  {
    id: 'basic',
    name: 'BASIC',
    title: 'The Forgotten Classroom Computer',
    era: '1964 — 1980s',
    badge: 'Democratic Computing',
    desc: 'Brought computing out of secretive labs and into living rooms and public high schools on Apple II and Commodore 64.',
    color: 'cyan',
    tag: 'Kemeny, Kurtz & Dartmouth',
  },
  {
    id: 'assembly',
    name: 'Assembly',
    title: 'The Machine Beneath the Machine',
    era: '1947 — Hardware Direct',
    badge: 'Silicon Speech',
    desc: 'Zero abstraction. Direct register manipulation and processor opcodes that forged early operating systems and BIOS routines.',
    color: 'purple',
    tag: 'Kathleen Booth & Early Mainframes',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ health, onEnterArchive, onSelectTechnology }) => {
  const isOnline = health?.ai_status.mode === 'online';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-xl border border-terminal-border bg-gradient-to-b from-terminal-surface/90 to-terminal-bg/95 p-6 md:p-12 overflow-hidden shadow-2xl">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #00ff66 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-terminal-green/30 bg-terminal-green/10 text-terminal-green text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEV Community Hacktoberfest 2026 — Ghost in the Machine</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl text-terminal-green text-glow-green tracking-wide uppercase leading-none font-bold">
            Echoes of the Forgotten
          </h1>

          <p className="text-base sm:text-lg text-terminal-text/90 leading-relaxed font-mono">
            Step inside a haunted digital archive where historical computing platforms and forgotten programming languages 
            speak once more through an AI-powered retro terminal grounded in verified primary sources.
          </p>

          {/* AI Status Badge */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
              isOnline 
                ? 'border-terminal-green/40 bg-terminal-green/10 text-terminal-green' 
                : 'border-terminal-amber/40 bg-terminal-amber/10 text-terminal-amber'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-terminal-green animate-pulse' : 'bg-terminal-amber'}`} />
              <span>
                {isOnline 
                  ? `AI Provider Online: ${health?.ai_status.model} (Groq)` 
                  : 'AI Provider: Offline Mode (Local BM25 Grounding Active)'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg border border-terminal-border bg-terminal-surface text-xs font-mono text-terminal-muted flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-terminal-green" />
              <span>100% Verified Citations • Zero Hallucinated URLs</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={onEnterArchive}
              className="px-6 py-3.5 rounded-lg bg-terminal-green text-terminal-bg font-mono font-bold tracking-wider uppercase text-sm hover:bg-terminal-green-bright transition-all shadow-phosphor-green flex items-center gap-2.5 active:scale-95"
            >
              <Terminal className="w-4 h-4" />
              <span>Enter the Archive</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('featured-tech');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-lg border border-terminal-border bg-terminal-surface/60 text-terminal-text font-mono text-sm hover:border-terminal-green/60 hover:text-terminal-green transition-all"
            >
              Explore Forgotten Languages
            </button>
          </div>
        </div>
      </section>

      {/* Grounded AI RAG Architecture Callout */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface/50 space-y-3">
          <div className="w-10 h-10 rounded border border-terminal-green/30 bg-terminal-bg flex items-center justify-center text-terminal-green">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="font-mono text-base font-bold text-terminal-green uppercase">
            1. Searchable Knowledge Base
          </h2>
          <p className="text-xs text-terminal-text/80 leading-relaxed font-mono">
            Curated historical documents from the Computer History Museum, IEEE annals, and university archives parsed by a CPU-friendly BM25 engine.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface/50 space-y-3">
          <div className="w-10 h-10 rounded border border-terminal-amber/30 bg-terminal-bg flex items-center justify-center text-terminal-amber">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="font-mono text-base font-bold text-terminal-amber uppercase">
            2. Open-Weight AI Inference
          </h2>
          <p className="text-xs text-terminal-text/80 leading-relaxed font-mono">
            Powered by open-weight Llama 3.1 8B. Bounded prompts strictly prevent hallucinations by separating creative persona play from verified facts.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface/50 space-y-3">
          <div className="w-10 h-10 rounded border border-terminal-green/30 bg-terminal-bg flex items-center justify-center text-terminal-green">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-mono text-base font-bold text-terminal-green uppercase">
            3. Offline Resiliency
          </h2>
          <p className="text-xs text-terminal-text/80 leading-relaxed font-mono">
            Zero API key required to explore. If external AI inference is unavailable, the archive synthesizes grounded playback directly from verified documents.
          </p>
        </div>
      </section>

      {/* Featured Technologies */}
      <section id="featured-tech" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-terminal-border pb-3">
          <div>
            <span className="text-xs font-mono text-terminal-green uppercase tracking-widest">
              Digital Archaeology
            </span>
            <h2 className="font-display text-3xl text-terminal-text text-glow-green font-bold">
              Featured Forgotten Technologies
            </h2>
          </div>
          <span className="text-xs font-mono text-terminal-muted">
            Select an artifact to converse with its machine spirit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_TECHNOLOGIES.map((tech) => (
            <div
              key={tech.id}
              onClick={() => onSelectTechnology(tech.id)}
              className="group cursor-pointer rounded-lg border border-terminal-border hover:border-terminal-green/70 bg-terminal-surface/40 hover:bg-terminal-surface/80 p-6 transition-all duration-200 hover:shadow-phosphor-green space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl text-terminal-green font-bold group-hover:text-glow-green">
                      {tech.name}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-terminal-muted/40 text-terminal-amber">
                      {tech.era}
                    </span>
                  </div>
                  <p className="text-xs text-terminal-muted font-mono mt-0.5">
                    {tech.title}
                  </p>
                </div>
                <span className="text-xs font-mono text-terminal-green opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Summon <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <p className="text-xs text-terminal-text/80 font-mono leading-relaxed">
                {tech.desc}
              </p>

              <div className="pt-2 border-t border-terminal-border/60 flex items-center justify-between text-[11px] font-mono text-terminal-muted">
                <span>{tech.tag}</span>
                <span className="text-terminal-green/80 group-hover:underline">
                  Open Terminal &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Honest AI & Academic Disclaimer */}
      <footer className="rounded-lg border border-terminal-border/80 bg-terminal-surface/20 p-5 text-xs font-mono text-terminal-muted space-y-2">
        <div className="flex items-center gap-2 text-terminal-amber">
          <HelpCircle className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider">Historical Accuracy & AI Roleplay Notice</span>
        </div>
        <p className="leading-relaxed">
          The conversational personas in this application are creative presentation layers. In accordance with responsible AI practices, 
          the AI does not claim consciousness or sentience. All historical claims, dates, and quotations are grounded in verified 
          document archives. Check citations on each response to inspect original sources.
        </p>
      </footer>
    </div>
  );
};
