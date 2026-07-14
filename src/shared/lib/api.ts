import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import { activeCompany } from './activeCompany';
import { notifyError } from './notify';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({ baseURL });

// Uma instância "crua" (sem interceptors) só para o refresh, evitando loop.
const rawApi = axios.create({ baseURL });

// ---- Request: anexa o JWT (E0.5) ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Empresa selecionada pelo ADMIN geral (item 7). O backend so respeita este
  // header para ADMIN; para os demais perfis ele e ignorado.
  const empresaId = activeCompany.get();
  if (empresaId) {
    config.headers['X-Empresa-Id'] = empresaId;
  }
  return config;
});

// ---- Response: trata 401 disparando refresh; se falhar, redireciona ----
let refreshing: Promise<string | null> | null = null;

function onSessionExpired() {
  tokenStorage.clear();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const { data } = await rawApi.post('/auth/refresh', { refreshToken });
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;

    // 401: tenta refresh uma vez. O endpoint de login/refresh não entra aqui.
    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      onSessionExpired();
    }

    // Tratamento global de erro (E0.9): mensagem amigável no snackbar.
    // Não notifica erros de validação de login (a própria tela mostra).
    if (!isAuthEndpoint) {
      notifyError(extractErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

// Backend usa RFC 7807 (ProblemDetail): { title, detail, status, ... }
export function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ detail?: string; title?: string; message?: string }>;
  const data = axiosError.response?.data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.title) return data.title;
  if (axiosError.code === 'ERR_NETWORK') return 'Sem conexão com o servidor. Tente novamente.';
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
