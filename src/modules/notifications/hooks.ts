import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './api';

const KEY = 'notifications';

// E14.3 — polling leve. Como o endpoint pode não existir ainda, não re-tentamos
// nem mostramos erro global: a query simplesmente fica vazia.
export function useNotificationsQuery() {
  return useQuery({
    queryKey: [KEY],
    queryFn: notificationsApi.list,
    refetchInterval: 60_000,
    retry: false,
    meta: { silent: true },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
