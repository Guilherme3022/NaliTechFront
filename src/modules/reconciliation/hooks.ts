import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { reconciliationApi } from './api';
import type { ConfirmRequest } from './types';

const KEY = 'reconciliations';

// E8.5 — hooks de conciliação.
export function usePendingReconciliationsQuery(
  params: PageParams & { clienteId?: string; competencia?: string },
) {
  return useQuery({ queryKey: [KEY, 'pending', params], queryFn: () => reconciliationApi.pending(params) });
}

export function useReconciliationHistoryQuery(
  params: PageParams & { status?: string; clienteId?: string; competencia?: string },
) {
  return useQuery({ queryKey: [KEY, 'history', params], queryFn: () => reconciliationApi.history(params) });
}

export function useConfirmReconciliationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ConfirmRequest }) =>
      reconciliationApi.confirm(id, body),
    onSuccess: () => {
      notifySuccess('Conciliação confirmada.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useRejectReconciliationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reconciliationApi.reject(id),
    onSuccess: () => {
      notifySuccess('Conciliação rejeitada.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
