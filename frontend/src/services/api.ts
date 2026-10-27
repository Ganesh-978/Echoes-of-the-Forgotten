import { HealthResponse, TechnologySummary, SourceReference, Discovery, TerminalCommandResult } from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Failed to fetch health: ${res.statusText}`);
    }
    return res.json();
  },

  async getTechnologies(): Promise<TechnologySummary[]> {
    const res = await fetch(`${API_BASE}/technologies`);
    if (!res.ok) {
      throw new Error(`Failed to fetch technologies: ${res.statusText}`);
    }
    return res.json();
  },

  async searchArchive(query: string, techFilter?: string): Promise<{ query: string; total_matches: number; results: SourceReference[] }> {
    const params = new URLSearchParams({ q: query });
    if (techFilter) params.append('tech', techFilter);
    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Search failed: ${res.statusText}`);
    }
    return res.json();
  },

  async sendChatMessage(payload: { technology_id: string; message: string; conversation_id?: string }) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Chat request failed');
    }
    return res.json();
  },

  async executeTerminalCommand(command_line: string, current_technology_id?: string): Promise<TerminalCommandResult> {
    const res = await fetch(`${API_BASE}/chat/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command_line, current_technology_id }),
    });
    if (!res.ok) {
      throw new Error('Command failed');
    }
    return res.json();
  },

  async getDiscoveries(): Promise<Discovery[]> {
    const res = await fetch(`${API_BASE}/discoveries`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  async saveDiscovery(payload: { title: string; content: string; technology_id: string; source_urls: string[] }): Promise<Discovery> {
    const res = await fetch(`${API_BASE}/discoveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to save discovery');
    }
    return res.json();
  },

  async deleteDiscovery(id: number): Promise<void> {
    await fetch(`${API_BASE}/discoveries/${id}`, { method: 'DELETE' });
  },
};
