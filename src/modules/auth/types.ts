export type RoleName = 'ADMIN' | 'CONTADOR' | 'AUXILIAR' | 'CLIENTE';
export type UserStatus = 'ATIVO' | 'INATIVO';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Perfil do usuário autenticado (GET /users/me).
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  twoFactorEnabled: boolean;
  roles: RoleName[];
  clienteId: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roles: RoleName[];
  clienteId?: string | null;
}

export interface UpdateUserRequest {
  name: string;
  roles: RoleName[];
  status: UserStatus;
}
