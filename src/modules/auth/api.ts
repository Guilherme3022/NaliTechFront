import { api } from '@/shared/lib/api';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  UserResponse,
} from './types';

export const authApi = {
  login: (body: LoginRequest) => api.post<LoginResponse>('/auth/login', body).then((r) => r.data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (body: ForgotPasswordRequest) => api.post('/auth/forgot-password', body),
  resetPassword: (body: ResetPasswordRequest) => api.post('/auth/reset-password', body),
  me: () => api.get<UserResponse>('/users/me').then((r) => r.data),
};
