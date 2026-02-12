// src/lib/api/chat.ts

import axiosInstance from './axios';
import { ChatSession, ChatSessionsResponse, ChatAnalytics, ChatMessage } from '../types/chat';

export const chatApi = {
  // Get session by ID
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await axiosInstance.get<ChatSession>(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Get session messages
  getSessionMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await axiosInstance.get<ChatMessage[]>(
      `/chat/sessions/${sessionId}/messages`
    );
    return response.data;
  },

  // Get flow sessions
  getFlowSessions: async (
    flowId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ChatSessionsResponse> => {
    const response = await axiosInstance.get<ChatSessionsResponse>(
      `/chat/flows/${flowId}/sessions`,
      { params: { page, limit } }
    );
    return response.data;
  },

  // Get flow analytics
  getFlowAnalytics: async (flowId: string): Promise<ChatAnalytics> => {
    const response = await axiosInstance.get<ChatAnalytics>(
      `/chat/flows/${flowId}/analytics`
    );
    return response.data;
  },

  // Get user sessions
  getUserSessions: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ChatSessionsResponse> => {
    const response = await axiosInstance.get<ChatSessionsResponse>('/chat/user/sessions', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get overall stats (admin only)
  getOverallStats: async (): Promise<{
    totalSessions: number;
    totalMessages: number;
    activeFlows: number;
  }> => {
    const response = await axiosInstance.get('/chat/stats');
    return response.data;
  },

  // Cleanup old sessions (admin only)
  cleanupSessions: async (days: number = 30): Promise<{ deletedCount: number; message: string }> => {
    const response = await axiosInstance.delete('/chat/cleanup', {
      params: { days },
    });
    return response.data;
  },
};
