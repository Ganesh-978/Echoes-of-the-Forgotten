import React, { useState, useEffect } from 'react';
import { Bookmark, MessageSquare, Trash2, ExternalLink, Calendar, Terminal, Database, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Discovery, ConversationSummary } from '../types';

interface MemoryPageProps {
  onOpenTerminalWithTech?: (techId: string) => void;
}

export const MemoryPage: React.FC<MemoryPageProps> = ({ onOpenTerminalWithTech }) => {
  const [activeTab, setActiveTab] = useState<'discoveries' | 'conversations'>('discoveries');
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any[] | null>(null);

  const fetchDiscoveries = async () => {
    try {
      setLoading(true);
      const data = await api.getDiscoveries();
      setDiscoveries(data);
    } catch (err) {
      console.error('Failed to load discoveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discoveries') {
      fetchDiscoveries();
    } else {
      fetchConversations();
    }
  }, [activeTab]);

  const handleDeleteDiscovery = async (id: number) => {
    try {
      await api.deleteDiscovery(id);
      setDiscoveries((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete discovery:', err);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
      if (selectedConversation && selectedConversation[0]?.conversation_id === convId) {
        setSelectedConversation(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleInspectConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedConversation(data);
      }
    } catch (err) {
      console.error('Failed to inspect conversation:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3 border-b border-terminal-border pb-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-terminal-green" />
          <h1 className="font-display text-3xl sm:text-4xl text-terminal-green text-glow-green font-bold uppercase tracking-wider">
            Memory Vault (SQLite Persistence)
          </h1>
        </div>
        <p className="text-sm font-mono text-terminal-text/80 max-w-3xl leading-relaxed">
          The memory vault provides local persistence using SQLite. Here you can inspect your bookmarked discoveries, 
          review past conversation sessions with machine spirits, or delete archived data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-terminal-border pb-2" role="tablist">
        <button
          onClick={() => {
            setActiveTab('discoveries');
            setSelectedConversation(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === 'discoveries'
              ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/60 shadow-phosphor-green font-bold'
              : 'text-terminal-muted hover:text-terminal-text border border-transparent'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Discoveries ({discoveries.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('conversations');
            setSelectedConversation(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === 'conversations'
              ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/60 shadow-phosphor-green font-bold'
              : 'text-terminal-muted hover:text-terminal-text border border-transparent'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Past Sessions ({conversations.length})</span>
        </button>
      </div>

      {/* Tab: Saved Discoveries */}
      {activeTab === 'discoveries' && (
        <div className="space-y-4">
          {loading && (
            <p className="text-xs font-mono text-terminal-muted">Reading SQLite memory vault...</p>
          )}

          {!loading && discoveries.length === 0 && (
            <div className="p-8 rounded-lg border border-terminal-border bg-terminal-surface/40 text-center font-mono space-y-3">
              <p className="text-terminal-amber text-sm font-bold">
                No discoveries saved yet.
              </p>
              <p className="text-xs text-terminal-muted max-w-md mx-auto">
                While exploring the Archive or conversing with machine spirits in the Haunted Terminal, 
                click "Bookmark Insight" or "Save to Memory Vault" to preserve findings here.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discoveries.map((discovery) => (
              <div
                key={discovery.id}
                className="rounded-lg border border-terminal-border bg-terminal-surface/40 hover:border-terminal-green/40 p-5 font-mono space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-terminal-muted/30 text-terminal-amber border border-terminal-muted/40 font-bold">
                      {discovery.technology_id}
                    </span>
                    <span className="text-[11px] text-terminal-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(discovery.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-terminal-green font-bold">
                    {discovery.title}
                  </h3>

                  <p className="text-xs text-terminal-text/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {discovery.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-terminal-border/60 flex items-center justify-between text-xs">
                  {discovery.source_urls && discovery.source_urls.length > 0 ? (
                    <a
                      href={discovery.source_urls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-green hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verified Archive</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-terminal-muted">No external URL</span>
                  )}

                  <button
                    onClick={() => handleDeleteDiscovery(discovery.id)}
                    title="Delete discovery"
                    className="text-terminal-muted hover:text-red-400 p-1 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Past Sessions */}
      {activeTab === 'conversations' && (
        <div className="space-y-6">
          {loading && (
            <p className="text-xs font-mono text-terminal-muted">Scanning past session records...</p>
          )}

          {!loading && conversations.length === 0 && (
            <div className="p-8 rounded-lg border border-terminal-border bg-terminal-surface/40 text-center font-mono space-y-3">
              <p className="text-terminal-amber text-sm font-bold">
                No past conversation sessions found.
              </p>
              <p className="text-xs text-terminal-muted max-w-md mx-auto">
                Open the Haunted Terminal and chat with COBOL, FORTRAN, BASIC, or Assembly. 
                Your sessions will be automatically stored in the local SQLite database.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className="rounded-lg border border-terminal-border bg-terminal-surface/40 hover:border-terminal-green/40 p-5 font-mono space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-terminal-muted/30 text-terminal-amber border border-terminal-muted/40 font-bold">
                      {conv.technology_id}
                    </span>
                    <span className="text-[11px] text-terminal-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-terminal-muted">
                    Session ID: <code className="text-terminal-green">{conv.conversation_id}</code>
                  </p>

                  <p className="text-xs text-terminal-text/90 line-clamp-2">
                    &gt; "{conv.first_message}"
                  </p>

                  <p className="text-[11px] text-terminal-muted">
                    Total messages exchanged: <strong className="text-terminal-green">{conv.message_count}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-terminal-border/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleInspectConversation(conv.conversation_id)}
                    className="text-terminal-green hover:underline font-bold"
                  >
                    View Transcript &rarr;
                  </button>

                  <div className="flex items-center gap-3">
                    {onOpenTerminalWithTech && (
                      <button
                        onClick={() => onOpenTerminalWithTech(conv.technology_id)}
                        title="Resume in Haunted Terminal"
                        className="text-terminal-muted hover:text-terminal-green flex items-center gap-1 text-[11px]"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteConversation(conv.conversation_id)}
                      title="Delete conversation"
                      className="text-terminal-muted hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transcript Inspector Modal */}
          {selectedConversation && (
            <div className="p-6 rounded-xl border border-terminal-green/50 bg-terminal-surface shadow-phosphor-green font-mono space-y-4">
              <div className="flex items-center justify-between border-b border-terminal-border pb-3">
                <h3 className="font-display text-2xl text-terminal-green font-bold">
                  Session Transcript [{selectedConversation[0]?.conversation_id}]
                </h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-xs text-terminal-muted hover:text-terminal-green px-2 py-1 rounded border border-terminal-border"
                >
                  Close Transcript
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {selectedConversation.map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-terminal-bg border border-terminal-border ml-6 text-terminal-text'
                        : 'bg-terminal-surface border border-terminal-green/30 mr-6 text-terminal-green'
                    }`}
                  >
                    <div className="text-[10px] text-terminal-muted mb-1 font-bold">
                      {m.role === 'user' ? '> USER' : `> SPIRIT (${m.is_offline ? 'OFFLINE' : 'ONLINE'})`} — {new Date(m.created_at).toLocaleTimeString()}
                    </div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
