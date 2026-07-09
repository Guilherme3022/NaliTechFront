import type { EnqueueSnackbar } from 'notistack';

// Ponte para o snackbar do notistack ser acessível fora de componentes React
// (ex: interceptor do Axios). O SnackbarProvider registra a função no bootstrap.
let enqueue: EnqueueSnackbar | null = null;

export function registerSnackbar(fn: EnqueueSnackbar) {
  enqueue = fn;
}

export function notifyError(message: string) {
  enqueue?.(message, { variant: 'error' });
}

export function notifySuccess(message: string) {
  enqueue?.(message, { variant: 'success' });
}

export function notifyInfo(message: string) {
  enqueue?.(message, { variant: 'info' });
}
