import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { exportsApi } from './api';
import type { ExportParams } from './types';

// E10.4 — hooks de exportação.
export function useLayoutsQuery() {
  return useQuery({ queryKey: ['layouts'], queryFn: exportsApi.sistemas });
}

export function useExportHistoryQuery(params: PageParams) {
  return useQuery({ queryKey: ['layouts', 'history', params], queryFn: () => exportsApi.history(params) });
}

// Increment 6 — validação pré-export para o período selecionado.
export function useExportValidationQuery(inicio: string, fim: string, enabled: boolean) {
  return useQuery({
    queryKey: ['layouts', 'validation', inicio, fim],
    queryFn: () => exportsApi.validate(inicio, fim),
    enabled,
  });
}

export function useExportLayoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ExportParams) => exportsApi.export(params),
    onSuccess: () => {
      notifySuccess('Exportação gerada. O download começará automaticamente.');
      qc.invalidateQueries({ queryKey: ['layouts', 'history'] });
    },
  });
}
