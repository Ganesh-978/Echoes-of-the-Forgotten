export interface AIStatus {
  mode: 'online' | 'offline';
  provider: string;
  model: string;
  description: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  ai_status: AIStatus;
}

export interface SourceReference {
  document_id: string;
  title: string;
  topic: string;
  publication_date?: string;
  source_title: string;
  source_url: string;
  technology: string;
  excerpt: string;
  relevance_score?: number;
}

export interface TechnologySummary {
  id: string;
  name: string;
  title: string;
  era: string;
  personality: string;
  system_prompt: string;
  intro_message: string;
  theme_color: string;
  document_count: number;
  suggested_questions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: SourceReference[];
  isOfflineSynthesis?: boolean;
}

export interface Discovery {
  id: number;
  title: string;
  content: string;
  technology_id: string;
  source_urls: string[];
  created_at: string;
}

export interface TerminalCommandResult {
  command: string;
  output: string;
  command_type: 'system' | 'navigation' | 'info' | 'clear' | 'error';
  new_technology_id?: string;
}

export interface ConversationSummary {
  conversation_id: string;
  technology_id: string;
  message_count: number;
  first_message: string;
  created_at: string;
  updated_at: string;
}
