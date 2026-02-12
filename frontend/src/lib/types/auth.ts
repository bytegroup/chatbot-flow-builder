// src/lib/types/auth.ts

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  settings: {
    theme: 'light' | 'dark';
    autoSave: boolean;
    autoSaveInterval: number;
  };
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
  settings?: {
    theme?: 'light' | 'dark';
    autoSave?: boolean;
    autoSaveInterval?: number;
  };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
