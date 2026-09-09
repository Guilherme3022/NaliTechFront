import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { uploadsApi } from './api';
import type { UploadStatus } from './types';

const KEY = 'uploads';
const FINAL_STATUSES: UploadStatus[] = ['CONCLUIDO', 'ERRO'];

// E4.4 — hooks de upload.
export function useUploadFileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      clienteId,
      origem,
      bankAccountId,
      onProgress,
    }: {
      file: File;
      clienteId?: string;
      origem?: 'EXTRATO' | 'SISTEMA';
      bankAccountId?: string;
      onProgress?: (pct: number) => void;
    }) => uploadsApi.upload(file, clienteId, origem, bankAccountId, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// E4.2 — lista com polling enquanto houver itens em processamento.
export function useUploadsQuery(params: PageParams & { clienteId?: string; status?: string }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => uploadsApi.list(params),
    refetchInterval: (query) => {
      const data = query.state.data;
      const processing = data?.content.some((u) => !FINAL_STATUSES.includes(u.status));
      return processing ? 4000 : false;
    },
  });
}

// E5/6/7 — detalhe com polling condicional (só enquanto não finalizar).
export function useUploadDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: () => uploadsApi.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      return FINAL_STATUSES.includes(data.status) ? false : 3000;
    },
  });
}

export function useSubstituteUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, justificativa }: { id: string; file: File; justificativa?: string }) =>
      uploadsApi.substitute(id, file, justificativa),
    onSuccess: () => {
      notifySuccess('Arquivo substituído (nova versão).');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uploadsApi.remove(id),
    onSuccess: () => {
      notifySuccess('Upload removido.');
      // A exclusao remove em cascata movimentacoes e itens de conciliacao; atualiza
      // as telas que dependem disso (conciliacao, movimentacoes e dashboard).
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['reconciliations'] });
      qc.invalidateQueries({ queryKey: ['conciliacoes'] });
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
