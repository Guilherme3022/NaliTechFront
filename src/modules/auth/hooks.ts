import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';
import type { ForgotPasswordRequest, LoginRequest, ResetPasswordRequest } from './types';

// E1.6 — hooks de autenticação.
export function useLogin() {
  return useMutation({ mutationFn: (body: LoginRequest) => authApi.login(body) });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (body: ForgotPasswordRequest) => authApi.forgotPassword(body) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (body: ResetPasswordRequest) => authApi.resetPassword(body) });
}
