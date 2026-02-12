// src/lib/api/auth.ts

import axiosInstance from './axios';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../types/auth';

export const authApi = {
  // Register new user
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Refresh access token
  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/auth/logout', { refreshToken });
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await axiosInstance.put<User>('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await axiosInstance.put('/auth/change-password', data);
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.delete('/auth/account');
    return response.data;
  },
};
