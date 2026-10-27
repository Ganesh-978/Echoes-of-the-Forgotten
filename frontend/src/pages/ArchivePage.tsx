import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Calendar, Bookmark, Terminal, BookOpen, Check } from 'lucide-react';
import { api } from '../services/api';
import { SourceReference } from '../types';
import { DocumentViewer } from '../components/archive/DocumentViewer';

interface ArchivePageProps {
  onSelectTechnology: (techId: string) => void;
}

const TECH_FILTERS = [
  { id: 'all', label: 'All Archives' },
  { id: 'cobol', label: 'COBOL' },
  { id: 'fortran', label: 'FORTRAN' },
  { id: 'basic', label: 'BASIC' },
  { id: 'assembly', label: 'Assembly' },
];

export const ArchivePage: React.FC<ArchivePageProps> = ({ onSelectTechnology }) => {
  const [query, setQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('all');
  const [documents, setDocuments] = useState<SourceReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState<SourceReference | null>(null);
  const [savedDocIds, setSavedDocIds] = useState<Set<string>>(new Set());

  // Search function
  const executeSearch = async (searchTerm: string, techFilter: string) => {
    try {
      setLoading(true);
      const filter = techFilter === 'all' ? undefined : techFilter;
      // If query is empty, pass a broad term or search across archive
      const term = searchTerm.trim() || 'system';
      const data = await api.searchArchive(term, filter);
      setDocuments(data.results);
    } catch (err) {
      console.error('Failed to search archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query, selectedTech);
  }, [selectedTech]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, selectedTech);
  };

  const handleSaveDiscovery = async (doc: SourceReference) => {
    try {
      await api.saveDiscovery({
        title: doc.title,
        content: doc.excerpt,
        technology_id: doc.technology,
        source_urls: [doc.source_url],
      });
      setSavedDocIds((prev) => new Set([...prev, doc.document_id]));
    } catch (err) {
      console.error('Failed to save discovery:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Description */}
      <div className="space-y-3 border-b border-terminal-border pb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-terminal-green" />
          <h1 className="font-display text-3xl sm:text-4xl text-terminal-green text-glow-green font-bold uppercase tracking-wider">
            Verified Historical Archive
          </h1>
        </div>
        <p className="text-sm font-mono text-terminal-text/80 max-w-3xl leading-relaxed">
          Explore curated primary records from the Computer History Museum, IEEE historical annals, and university archives.
          Every passage in this digital repository is indexed with pure-Python BM25 and supplies verifiable evidence for the ghost terminal.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-terminal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords (e.g., 'Grace Hopper', 'John Backus', 'Dartmouth', 'mnemonics')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-terminal-border bg-terminal-surface text-sm font-mono text-terminal-text focus:outline-none focus:border-terminal-green focus:ring-1 focus:ring-terminal-green"
              aria-label="Search archive documents"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-terminal-green text-terminal-bg font-mono font-bold text-xs uppercase hover:bg-terminal-green-bright transition-all shadow-phosphor-green"
          >
            Search
          </button>
        </form>

        {/* Technology Filter Pills */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter documents by technology">
          {TECH_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedTech(filter.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase transition-all ${
                selectedTech === filter.id
                  ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/60 shadow-phosphor-green font-bold'
                  : 'bg-terminal-surface/60 text-terminal-muted hover:text-terminal-text border border-terminal-border'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-terminal-muted">
          <span>{loading ? 'Searching archives...' : `Showing ${documents.length} verified documents`}</span>
          <span>BM25 CPU-Ranked Results</span>
        </div>

        {documents.length === 0 && !loading && (
          <div className="p-8 rounded-lg border border-terminal-border bg-terminal-surface/40 text-center font-mono space-y-3">
            <p className="text-terminal-amber text-sm font-bold">
              [!] No historical records match your search query.
            </p>
            <p className="text-xs text-terminal-muted max-w-md mx-auto">
              The archive strictly avoids returning unrelated documents. Try searching for terms like 'CODASYL', 'Backus', 'Altair', or 'Birkbeck'.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="rounded-lg border border-terminal-border bg-terminal-surface/40 hover:border-terminal-green/50 hover:bg-terminal-surface/70 p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-terminal-muted/30 text-terminal-amber border border-terminal-muted/40 font-bold">
                    {doc.technology}
                  </span>
                  {doc.publication_date && (
                    <span className="text-[11px] font-mono text-terminal-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.publication_date}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-xl text-terminal-green font-bold">
                  {doc.title}
                </h3>

                <p className="text-xs font-mono text-terminal-muted">
                  Topic: <span className="text-terminal-text/80">{doc.topic}</span>
                </p>

                <p className="text-xs font-mono text-terminal-text/90 line-clamp-3 leading-relaxed">
                  {doc.excerpt}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-terminal-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <button
                  onClick={() => setActiveDoc(doc)}
                  className="text-terminal-green hover:underline font-bold"
                >
                  Read Full Transcript &rarr;
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSaveDiscovery(doc)}
                    disabled={savedDocIds.has(doc.document_id)}
                    title="Save to Memory Vault"
                    className={`flex items-center gap-1 p-1 rounded transition-all ${
                      savedDocIds.has(doc.document_id)
                        ? 'text-terminal-green'
                        : 'text-terminal-muted hover:text-terminal-amber'
                    }`}
                  >
                    {savedDocIds.has(doc.document_id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-terminal-green" />
                        <span className="text-[10px]">Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Save</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectTechnology(doc.technology)}
                    title="Open terminal for this technology"
                    className="flex items-center gap-1 text-terminal-muted hover:text-terminal-green p-1"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Terminal</span>
                  </button>

                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open verified archival source URL"
                    className="text-terminal-muted hover:text-terminal-green"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Document Viewer Modal */}
      {activeDoc && (
        <DocumentViewer
          document={activeDoc}
          onClose={() => setActiveDoc(null)}
          onSaveToVault={handleSaveDiscovery}
          isSaved={savedDocIds.has(activeDoc.document_id)}
        />
      )}
    </div>
  );
};
