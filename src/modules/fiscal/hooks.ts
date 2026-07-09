import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { fiscalApi } from './api';
import type { ObligationRequest } from './types';

const KEY = 'fiscal-obligations';

// E13.4 — hooks de agenda fiscal.
export function useFiscalObligationsQuery(params: PageParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => fiscalApi.list(params) });
}

export function useUpcomingObligationsQuery(dias = 7) {
  return useQuery({ queryKey: [KEY, 'upcoming', dias], queryFn: () => fiscalApi.upcoming(dias) });
}

export function useCreateObligationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ObligationRequest) => fiscalApi.create(body),
    onSuccess: () => {
      notifySuccess('Obrigação criada.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteObligationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fiscalApi.remove(id),
    onSuccess: () => {
      notifySuccess('Obrigação removida.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
