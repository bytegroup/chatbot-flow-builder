// src/lib/api/flows.ts

import axiosInstance from './axios';
import {
  Flow,
  FlowsResponse,
  CreateFlowDto,
  UpdateFlowDto,
  ValidationResult,
  FlowVersion,
  FlowStats,
} from '../types/flow';

export interface FlowQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'active' | 'inactive';
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const flowsApi = {
  // Get all flows
  getFlows: async (params?: FlowQueryParams): Promise<FlowsResponse> => {
    const response = await axiosInstance.get<FlowsResponse>('/flows', { params });
    return response.data;
  },

  // Get flow by ID
  getFlow: async (id: string): Promise<Flow> => {
    const response = await axiosInstance.get<Flow>(`/flows/${id}`);
    return response.data;
  },

  // Create flow
  createFlow: async (data: CreateFlowDto): Promise<Flow> => {
    const response = await axiosInstance.post<Flow>('/flows', data);
    return response.data;
  },

  // Update flow
  updateFlow: async (id: string, data: UpdateFlowDto): Promise<Flow> => {
    const response = await axiosInstance.put<Flow>(`/flows/${id}`, data);
    return response.data;
  },

  // Delete flow
  deleteFlow: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/flows/${id}`);
  },

  // Duplicate flow
  duplicateFlow: async (
    id: string,
    data: { name: string; description?: string }
  ): Promise<Flow> => {
    const response = await axiosInstance.post<Flow>(`/flows/${id}/duplicate`, data);
    return response.data;
  },

  // Activate flow
  activateFlow: async (id: string): Promise<Flow> => {
    const response = await axiosInstance.patch<Flow>(`/flows/${id}/activate`);
    return response.data;
  },

  // Deactivate flow
  deactivateFlow: async (id: string): Promise<Flow> => {
    const response = await axiosInstance.patch<Flow>(`/flows/${id}/deactivate`);
    return response.data;
  },

  // Validate flow
  validateFlow: async (id: string): Promise<ValidationResult> => {
    const response = await axiosInstance.get<ValidationResult>(`/flows/${id}/validate`);
    return response.data;
  },

  // Export flow
  exportFlow: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/flows/${id}/export`);
    return response.data;
  },

  // Import flow
  importFlow: async (data: { flowData: any; name?: string }): Promise<Flow> => {
    const response = await axiosInstance.post<Flow>('/flows/import', data);
    return response.data;
  },

  // Get flow statistics
  getFlowStats: async (): Promise<FlowStats> => {
    const response = await axiosInstance.get<FlowStats>('/flows/stats');
    return response.data;
  },

  // Get templates
  getTemplates: async (params?: FlowQueryParams): Promise<FlowsResponse> => {
    const response = await axiosInstance.get<FlowsResponse>('/flows/templates', { params });
    return response.data;
  },

  // Version Management
  createVersion: async (
    id: string,
    data: { changeDescription?: string }
  ): Promise<FlowVersion> => {
    const response = await axiosInstance.post<FlowVersion>(`/flows/${id}/versions`, data);
    return response.data;
  },

  getVersions: async (id: string): Promise<FlowVersion[]> => {
    const response = await axiosInstance.get<FlowVersion[]>(`/flows/${id}/versions`);
    return response.data;
  },

  getVersion: async (id: string, versionNumber: number): Promise<FlowVersion> => {
    const response = await axiosInstance.get<FlowVersion>(
      `/flows/${id}/versions/${versionNumber}`
    );
    return response.data;
  },

  restoreVersion: async (id: string, versionNumber: number): Promise<Flow> => {
    const response = await axiosInstance.post<Flow>(
      `/flows/${id}/versions/${versionNumber}/restore`
    );
    return response.data;
  },
};
