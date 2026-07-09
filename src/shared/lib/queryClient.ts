import { QueryClient } from '@tanstack/react-query';

// Defaults globais (E0.3): staleTime moderado e retry conservador —
// não faz sentido re-tentar erros de autenticação/validação.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
