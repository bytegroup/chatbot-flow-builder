import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data;

              // Save new tokens
              this.setToken(accessToken);
              this.setRefreshToken(newRefreshToken);

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name: string, avatar?: string }) {
    try {
      const response = await this.client.post('/auth/register', data);
      const { accessToken, refreshToken } = response.data;
      this.setToken(accessToken);
      this.setRefreshToken(refreshToken);
      return response.data;
    } catch (err: any) {
      //console.error('Registration error:', err.response?.data || err.message);
      throw err;
    }
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data);
    const { accessToken, refreshToken } = response.data;
    this.setToken(accessToken);
    this.setRefreshToken(refreshToken);
    return response.data;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await this.client.post('/auth/logout', { refreshToken });
    }
    this.clearTokens();
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  // Flow endpoints
  async getFlows(params?: any) {
    const response = await this.client.get('/flows', { params });
    return response.data;
  }

  async getFlow(id: string) {
    const response = await this.client.get(`/flows/${id}`);
    return response.data;
  }

  async createFlow(data: any) {
    const response = await this.client.post('/flows', data);
    return response.data;
  }

  async updateFlow(id: string, data: any) {
    const response = await this.client.put(`/flows/${id}`, data);
    return response.data;
  }

  async deleteFlow(id: string) {
    await this.client.delete(`/flows/${id}`);
  }

  async duplicateFlow(id: string, data: { name: string; description?: string }) {
    const response = await this.client.post(`/flows/${id}/duplicate`, data);
    return response.data;
  }

  async activateFlow(id: string) {
    const response = await this.client.patch(`/flows/${id}/activate`);
    return response.data;
  }

  async deactivateFlow(id: string) {
    const response = await this.client.patch(`/flows/${id}/deactivate`);
    return response.data;
  }

  async validateFlow(id: string) {
    const response = await this.client.get(`/flows/${id}/validate`);
    return response.data;
  }

  async exportFlow(id: string) {
    const response = await this.client.get(`/flows/${id}/export`);
    return response.data;
  }

  async importFlow(data: any) {
    const response = await this.client.post('/flows/import', data);
    return response.data;
  }

  async getFlowStats() {
    const response = await this.client.get('/flows/stats');
    return response.data;
  }

  // Version endpoints
  async getVersions(flowId: string) {
    const response = await this.client.get(`/flows/${flowId}/versions`);
    return response.data;
  }

  async createVersion(flowId: string, data: { changeDescription?: string }) {
    const response = await this.client.post(`/flows/${flowId}/versions`, data);
    return response.data;
  }

  async restoreVersion(flowId: string, versionNumber: number) {
    const response = await this.client.post(
      `/flows/${flowId}/versions/${versionNumber}/restore`
    );
    return response.data;
  }

  // Chat endpoints
  async getChatSessions(flowId: string, params?: any) {
    const response = await this.client.get(`/chat/flows/${flowId}/sessions`, {
      params,
    });
    return response.data;
  }

  async getChatSession(sessionId: string) {
    const response = await this.client.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  async getChatAnalytics(flowId: string) {
    const response = await this.client.get(`/chat/flows/${flowId}/analytics`);
    return response.data;
  }
}

export const api = new ApiClient();
