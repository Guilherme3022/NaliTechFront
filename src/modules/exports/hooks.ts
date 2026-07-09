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
