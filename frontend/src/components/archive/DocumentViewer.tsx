import React from 'react';
import { ExternalLink, X, Bookmark, Calendar, FileText, Check } from 'lucide-react';
import { SourceReference } from '../../types';

interface DocumentViewerProps {
  document: SourceReference | null;
  onClose: () => void;
  onSaveToVault?: (doc: SourceReference) => void;
  isSaved?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose,
  onSaveToVault,
  isSaved = false,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl rounded-xl border border-terminal-green/50 bg-terminal-surface p-6 shadow-phosphor-green space-y-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-terminal-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-terminal-green/15 text-terminal-green border border-terminal-green/30 font-bold">
                {document.technology.toUpperCase()} ARCHIVE
              </span>
              {document.publication_date && (
                <span className="text-xs font-mono text-terminal-amber flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {document.publication_date}
                </span>
              )}
            </div>
            <h2 id="doc-modal-title" className="font-display text-2xl text-terminal-green text-glow-green font-bold">
              {document.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded border border-terminal-border hover:border-terminal-green text-terminal-muted hover:text-terminal-green transition-all"
            aria-label="Close document viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic & Metadata */}
        <div className="bg-terminal-bg/70 p-3 rounded-lg border border-terminal-border/60 text-xs font-mono space-y-1.5">
          <div>
            <span className="text-terminal-muted">Topic: </span>
            <span className="text-terminal-text">{document.topic}</span>
          </div>
          <div>
            <span className="text-terminal-muted">Document ID: </span>
            <code className="text-terminal-green font-bold">{document.document_id}</code>
          </div>
          <div>
            <span className="text-terminal-muted">Archival Source: </span>
            <span className="text-terminal-text">{document.source_title}</span>
          </div>
        </div>

        {/* Document Content / Excerpt */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-terminal-muted flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-terminal-green" />
            Archival Transcript Excerpt:
          </span>
          <div className="p-4 rounded-lg bg-terminal-bg border border-terminal-border font-mono text-xs sm:text-sm text-terminal-text/90 leading-relaxed whitespace-pre-wrap">
            {document.excerpt}
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-3 border-t border-terminal-border flex flex-wrap items-center justify-between gap-3">
          <a
            href={document.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-terminal-green hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify Original Source at Archive</span>
          </a>

          {onSaveToVault && (
            <button
              onClick={() => onSaveToVault(document)}
              disabled={isSaved}
              className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-terminal-muted/30 text-terminal-muted border border-terminal-muted/40 cursor-not-allowed'
                  : 'bg-terminal-green/20 border border-terminal-green text-terminal-green hover:bg-terminal-green/30'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Vault</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save to Memory Vault</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
