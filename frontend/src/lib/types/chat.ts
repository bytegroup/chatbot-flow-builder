// src/lib/types/chat.ts

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  nodeId?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  sessionId: string;
  flowId: string;
  userId?: string;
  status: 'active' | 'completed' | 'abandoned' | 'error';
  messages: ChatMessage[];
  currentNodeId?: string;
  variables: Record<string, any>;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionsResponse {
  sessions: ChatSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatAnalytics {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  errorSessions: number;
  activeSessions: number;
  completionRate: string;
  averageDuration: number;
  recentSessions: Array<{
    sessionId: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    duration?: number;
  }>;
}

// WebSocket Events
export interface ChatStartPayload {
  flowId: string;
  metadata?: any;
}

export interface ChatMessagePayload {
  sessionId: string;
  message: string;
}

export interface ChatResetPayload {
  sessionId: string;
}

export interface ChatBotMessageEvent {
  sessionId: string;
  message: {
    id: string;
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
}

export interface ChatSessionStartedEvent {
  sessionId: string;
  flowId: string;
}

export interface ChatWaitingInputEvent {
  sessionId: string;
  nodeId: string;
}

export interface ChatTypingEvent {
  sessionId: string;
  isTyping: boolean;
}

export interface ChatSessionEndedEvent {
  sessionId: string;
  status: 'completed' | 'abandoned' | 'error';
}

export interface ChatErrorEvent {
  sessionId?: string;
  message: string;
}
