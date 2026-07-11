import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifySuccess } from '@/shared/lib/notify';
import { importLayoutsApi } from './api';
import type { ImportLayoutRequest } from './types';

const KEY = 'import-layouts';

export function useImportLayoutsQuery() {
  return useQuery({ queryKey: [KEY], queryFn: importLayoutsApi.list });
}

export function useCreateImportLayoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ImportLayoutRequest) => importLayoutsApi.create(body),
    onSuccess: () => {
      notifySuccess('Layout criado.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useUpdateImportLayoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ImportLayoutRequest }) =>
      importLayoutsApi.update(id, body),
    onSuccess: () => {
      notifySuccess('Layout atualizado.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteImportLayoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => importLayoutsApi.remove(id),
    onSuccess: () => {
      notifySuccess('Layout removido.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function usePreviewImportLayoutMutation() {
  return useMutation({ mutationFn: importLayoutsApi.preview });
}
