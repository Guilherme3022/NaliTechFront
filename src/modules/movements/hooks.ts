import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { movementsApi } from './api';
import type { UpdateMovementRequest } from './types';

const KEY = 'movements';

export function useMovementsQuery(params: PageParams & { clienteId?: string; competencia?: string }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => movementsApi.list(params) });
}

export function useUpdateMovementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMovementRequest }) =>
      movementsApi.update(id, body),
    onSuccess: () => {
      notifySuccess('Movimentação atualizada.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteMovementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => movementsApi.remove(id),
    onSuccess: () => {
      notifySuccess('Movimentação removida.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
