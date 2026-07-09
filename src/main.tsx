import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { theme } from '@/shared/lib/theme';
import { queryClient } from '@/shared/lib/queryClient';
import { registerSnackbar } from '@/shared/lib/notify';
import { AuthProvider } from '@/modules/auth/AuthContext';
import { App } from './App';

// Registra o enqueueSnackbar para uso fora de componentes (interceptor do Axios).
function SnackbarBridge() {
  const { enqueueSnackbar } = useSnackbar();
  registerSnackbar(enqueueSnackbar);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={5000}
      >
        <SnackbarBridge />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
