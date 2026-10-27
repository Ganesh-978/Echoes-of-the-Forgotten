import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Send, 
  RotateCcw, 
  ExternalLink, 
  Bookmark, 
  Cpu, 
  Sparkles, 
  Info, 
  Check, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { TechnologySummary, ChatMessage, SourceReference } from '../types';
import { DocumentViewer } from '../components/archive/DocumentViewer';

interface TerminalPageProps {
  initialTechnologyId?: string;
  onSelectTechnology?: (techId: string) => void;
}

export const TerminalPage: React.FC<TerminalPageProps> = ({ 
  initialTechnologyId = 'cobol',
}) => {
  const [currentTechId, setCurrentTechId] = useState<string>(initialTechnologyId);
  const [technologies, setTechnologies] = useState<TechnologySummary[]>([]);
  const [currentTech, setCurrentTech] = useState<TechnologySummary | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inspectDoc, setInspectDoc] = useState<SourceReference | null>(null);
  const [savedDiscoveries, setSavedDiscoveries] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load technologies metadata
  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const data = await api.getTechnologies();
        setTechnologies(data);
        const match = data.find((t) => t.id === currentTechId) || data[0];
        if (match) {
          setCurrentTech(match);
          initWelcomeMessage(match);
        }
      } catch (err) {
        console.error('Failed to load technologies:', err);
      }
    };
    fetchTechs();
  }, [currentTechId]);

  const initWelcomeMessage = (tech: TechnologySummary) => {
    setMessages([
      {
        id: `welcome-${tech.id}`,
        role: 'system',
        content: `[FREQUENCY TUNED TO: ${tech.name.toUpperCase()} // ${tech.title.toUpperCase()}]\n${tech.intro_message}\n\nType 'help' for safe terminal commands, or ask a question below.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setConversationId(undefined);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSwitchTechnology = (newId: string) => {
    if (newId === currentTechId) return;
    setCurrentTechId(newId);
  };

  const handleResetConversation = () => {
    if (currentTech) {
      initWelcomeMessage(currentTech);
      setErrorMessage(null);
    }
  };

  const handleSaveDiscovery = async (title: string, content: string, sourceUrls: string[]) => {
    try {
      await api.saveDiscovery({
        title,
        content,
        technology_id: currentTechId,
        source_urls: sourceUrls,
      });
      setSavedDiscoveries((prev) => new Set([...prev, title]));
    } catch (err) {
      console.error('Failed to save discovery:', err);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query || loading) return;

    if (query.length > 500) {
      setErrorMessage('Input exceeds maximum length of 500 characters.');
      return;
    }

    setErrorMessage(null);
    setInputValue('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Check if input is a safe terminal command
    const firstWord = query.toLowerCase().split(' ')[0].replace(/^[\/:]/, '');
    const validCommands = ['help', 'whoami', 'list', 'switch', 'search', 'inspect', 'clear', 'history', 'exit'];

    if (validCommands.includes(firstWord)) {
      try {
        const cmdRes = await api.executeTerminalCommand(query.replace(/^[\/:]/, ''), currentTechId);
        
        if (cmdRes.command_type === 'clear') {
          if (currentTech) initWelcomeMessage(currentTech);
          setLoading(false);
          return;
        }

        if (cmdRes.new_technology_id) {
          handleSwitchTechnology(cmdRes.new_technology_id);
          setLoading(false);
          return;
        }

        const cmdMsg: ChatMessage = {
          id: `cmd-${Date.now()}`,
          role: 'system',
          content: cmdRes.output,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, cmdMsg]);
      } catch (err: any) {
        setErrorMessage(err.message || 'Command execution failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Standard RAG chat submission
    try {
      const res = await api.sendChatMessage({
        technology_id: currentTechId,
        message: query,
        conversation_id: conversationId,
      });

      setConversationId(res.conversation_id);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
        sources: res.sources,
        isOfflineSynthesis: res.is_offline_synthesis,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to receive response from archive.');
      const errAlert: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: `[TERMINAL ERROR]: ${err.message || 'Communication failure.'} Type 'help' or try asking about documented topics.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errAlert]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedPromptClick = (promptText: string) => {
    setInputValue(promptText);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Technology Persona Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {technologies.map((tech) => (
            <button
              key={tech.id}
              onClick={() => handleSwitchTechnology(tech.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
                tech.id === currentTechId
                  ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/60 shadow-phosphor-green font-bold'
                  : 'bg-terminal-surface/60 text-terminal-muted hover:text-terminal-text border border-terminal-border'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${tech.id === currentTechId ? 'bg-terminal-green animate-pulse' : 'bg-terminal-muted'}`} />
              <span>{tech.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleResetConversation}
          title="Reset conversation channel"
          className="text-xs font-mono text-terminal-muted hover:text-terminal-amber flex items-center gap-1.5 px-2.5 py-1 rounded border border-terminal-border hover:border-terminal-amber/50 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Channel</span>
        </button>
      </div>

      {/* Terminal Main Enclosure */}
      <div className="rounded-xl border border-terminal-border bg-terminal-bg shadow-2xl overflow-hidden flex flex-col h-[700px] border-t-2 border-t-terminal-green/60">
        {/* Terminal Title Bar */}
        <div className="bg-terminal-surface px-4 py-2.5 border-b border-terminal-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-terminal-text/90">
            <TerminalIcon className="w-4 h-4 text-terminal-green" />
            <span className="font-bold text-terminal-green">
              {currentTech ? `${currentTech.name.toUpperCase()} // ${currentTech.era}` : 'ARCHIVE TERMINAL'}
            </span>
            <span className="text-terminal-muted hidden sm:inline">
              — {currentTech?.title}
            </span>
          </div>

          <div className="flex items-center gap-3 text-terminal-muted text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-ping" />
              PORT 8000
            </span>
            <span className="border-l border-terminal-border pl-3 hidden md:inline">
              BM25 Grounded
            </span>
          </div>
        </div>

        {/* Terminal Messages Output Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 font-mono text-xs sm:text-sm">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* Message Header */}
              <div className="flex items-center justify-between text-[11px] text-terminal-muted">
                <span className="flex items-center gap-2">
                  {msg.role === 'user' ? (
                    <strong className="text-terminal-amber uppercase font-bold">&gt; USER</strong>
                  ) : msg.role === 'assistant' ? (
                    <strong className="text-terminal-green uppercase font-bold flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      {currentTech?.name || 'ASSISTANT'} (ARCHIVE SPIRIT)
                    </strong>
                  ) : (
                    <strong className="text-terminal-muted uppercase font-bold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      SYSTEM CHANNEL
                    </strong>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Content Box */}
              <div
                className={`p-3.5 rounded-lg leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-terminal-surface/80 border border-terminal-border text-terminal-text ml-4'
                    : msg.role === 'assistant'
                    ? 'bg-terminal-surface/40 border border-terminal-green/30 text-terminal-green text-glow-green mr-4'
                    : 'bg-terminal-muted/10 border border-terminal-muted/30 text-terminal-muted'
                }`}
              >
                {msg.content}
              </div>

              {/* Verified Sources Badge Area (for assistant messages) */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mr-4 p-3 rounded-lg bg-terminal-bg/80 border border-terminal-border/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-terminal-muted">
                    <span className="flex items-center gap-1 text-terminal-green font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Verified Primary Sources ({msg.sources.length}):
                    </span>
                    <button
                      onClick={() =>
                        handleSaveDiscovery(
                          `Discovery: ${currentTech?.name} (${msg.sources?.[0]?.title || 'Insight'})`,
                          msg.content,
                          msg.sources?.map((s) => s.source_url) || []
                        )
                      }
                      className="text-terminal-amber hover:underline flex items-center gap-1"
                    >
                      {savedDiscoveries.has(`Discovery: ${currentTech?.name} (${msg.sources?.[0]?.title || 'Insight'})`) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-terminal-green" />
                          <span className="text-terminal-green">Saved in Vault</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Bookmark Insight</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src) => (
                      <div
                        key={src.document_id}
                        className="p-2.5 rounded bg-terminal-surface/60 border border-terminal-border flex flex-col justify-between space-y-1.5"
                      >
                        <div>
                          <p className="font-bold text-terminal-green truncate">{src.title}</p>
                          <p className="text-[10px] text-terminal-muted truncate">{src.source_title}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-terminal-border/40 text-[10px]">
                          <button
                            onClick={() => setInspectDoc(src)}
                            className="text-terminal-green hover:underline font-bold"
                          >
                            Inspect Excerpt
                          </button>
                          <a
                            href={src.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-terminal-muted hover:text-terminal-green flex items-center gap-1"
                          >
                            <span>Archive URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="space-y-2 mr-4">
              <div className="text-[11px] text-terminal-green font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-terminal-green animate-ping" />
                <span>QUERYING ARCHIVE & SYNTHESIZING MEMORY...</span>
              </div>
              <div className="p-3 rounded-lg bg-terminal-surface/30 border border-terminal-green/20 text-terminal-muted text-xs animate-pulse">
                &gt; Scanning BM25 index... Extracting primary sources... Bound checking prompts...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        {currentTech && currentTech.suggested_questions && (
          <div className="px-4 py-2 border-t border-terminal-border bg-terminal-surface/30 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-terminal-muted flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-terminal-amber" />
              Suggested:
            </span>
            {currentTech.suggested_questions.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedPromptClick(promptText)}
                className="text-[11px] font-mono px-2.5 py-1 rounded border border-terminal-border bg-terminal-surface/60 hover:border-terminal-green/60 hover:text-terminal-green text-terminal-text/80 transition-all text-left truncate max-w-xs"
              >
                {promptText}
              </button>
            ))}
          </div>
        )}

        {/* Terminal Input Box */}
        <div className="p-3 border-t border-terminal-border bg-terminal-surface/90">
          {errorMessage && (
            <div className="mb-2 text-xs font-mono text-red-400 bg-red-950/40 p-2 rounded border border-red-800/40">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
                placeholder="Ask a historical question or type safe command (e.g., 'whoami', 'help', 'search <terms>', 'inspect <id>')..."
                className="w-full resize-none rounded-lg border border-terminal-border bg-terminal-bg px-3.5 py-2.5 text-xs sm:text-sm font-mono text-terminal-text focus:outline-none focus:border-terminal-green focus:ring-1 focus:ring-terminal-green placeholder:text-terminal-muted disabled:opacity-50"
                aria-label="Terminal input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="h-[52px] px-4 rounded-lg bg-terminal-green text-terminal-bg font-mono font-bold text-xs uppercase hover:bg-terminal-green-bright transition-all shadow-phosphor-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95"
              aria-label="Transmit message"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-terminal-muted mt-2 px-1">
            <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline</span>
            <span>Supports safe terminal commands (help, whoami, search, inspect)</span>
          </div>
        </div>
      </div>

      {/* Full Document Inspector Modal */}
      {inspectDoc && (
        <DocumentViewer
          document={inspectDoc}
          onClose={() => setInspectDoc(null)}
          onSaveToVault={(doc) =>
            handleSaveDiscovery(doc.title, doc.excerpt, [doc.source_url])
          }
          isSaved={savedDiscoveries.has(inspectDoc.title)}
        />
      )}
    </div>
  );
};
