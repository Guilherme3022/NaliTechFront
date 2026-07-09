// Armazenamento simples dos tokens JWT. Centralizado para o interceptor do
// Axios e o AuthContext lerem/gravarem do mesmo lugar.
const ACCESS_KEY = 'ledgerflow.accessToken';
const REFRESH_KEY = 'ledgerflow.refreshToken';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
