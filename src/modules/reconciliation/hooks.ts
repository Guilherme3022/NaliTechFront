import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { conciliacoesApi, reconciliationApi, reconciliationProfilesApi } from './api';
import type {
  BatchConfirmItem,
  ConfirmRequest,
  CreateConciliacaoRequest,
  ReconciliationProfileRequest,
} from './types';

const KEY = 'reconciliations';
const CONCILIACOES_KEY = 'conciliacoes';
const PROFILES_KEY = 'reconciliation-profiles';

export function useProfilesQuery(clienteId: string | undefined) {
  return useQuery({
    queryKey: [PROFILES_KEY, clienteId],
    queryFn: () => reconciliationProfilesApi.list(clienteId),
    enabled: !!clienteId,
  });
}

export function useCreateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReconciliationProfileRequest) => reconciliationProfilesApi.create(body),
    onSuccess: () => {
      notifySuccess('Perfil criado.');
      qc.invalidateQueries({ queryKey: [PROFILES_KEY] });
    },
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReconciliationProfileRequest }) =>
      reconciliationProfilesApi.update(id, body),
    onSuccess: () => {
      notifySuccess('Perfil atualizado.');
      qc.invalidateQueries({ queryKey: [PROFILES_KEY] });
    },
  });
}

export function useDeleteProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reconciliationProfilesApi.remove(id),
    onSuccess: () => {
      notifySuccess('Perfil removido.');
      qc.invalidateQueries({ queryKey: [PROFILES_KEY] });
    },
  });
}

// Lotes de conciliacao (cards) por cliente/competencia.
export function useConciliacoesQuery(params: { clienteId?: string; competencia?: string }) {
  return useQuery({
    queryKey: [CONCILIACOES_KEY, params],
    queryFn: () => conciliacoesApi.list(params),
    enabled: !!params.clienteId,
  });
}

export function useCreateConciliacaoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConciliacaoRequest) => conciliacoesApi.create(body),
    onSuccess: () => {
      notifySuccess('Conciliação criada.');
      qc.invalidateQueries({ queryKey: [CONCILIACOES_KEY] });
    },
  });
}

export function useConciliacaoQuery(id: string | undefined) {
  return useQuery({
    queryKey: [CONCILIACOES_KEY, 'detail', id],
    queryFn: () => conciliacoesApi.getById(id!),
    enabled: !!id,
  });
}

export function useAttachUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, uploadId }: { id: string; uploadId: string }) =>
      conciliacoesApi.attachUpload(id, uploadId),
    onSuccess: () => {
      notifySuccess('Arquivo anexado à conciliação.');
      qc.invalidateQueries({ queryKey: [CONCILIACOES_KEY] });
      // O processamento (OCR/parse/match) e assincrono; invalida as listas de itens
      // para elas voltarem a buscar assim que as movimentacoes forem geradas.
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useConcluirConciliacaoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conciliacoesApi.concluir(id),
    onSuccess: () => {
      notifySuccess('Conciliação concluída.');
      qc.invalidateQueries({ queryKey: [CONCILIACOES_KEY] });
    },
  });
}

export function useCancelarConciliacaoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conciliacoesApi.cancelar(id),
    onSuccess: () => {
      notifySuccess('Conciliação cancelada.');
      qc.invalidateQueries({ queryKey: [CONCILIACOES_KEY] });
    },
  });
}

// E8.5 — hooks de conciliação.
// Faz polling: o pipeline (OCR/parse/normalizacao/match) roda de forma assincrona no
// backend, entao os itens aparecem alguns segundos apos anexar o arquivo — sem precisar
// sair e voltar da tela.
export function usePendingReconciliationsQuery(
  params: PageParams & { clienteId?: string; competencia?: string },
) {
  return useQuery({
    queryKey: [KEY, 'pending', params],
    queryFn: () => reconciliationApi.pending(params),
    refetchInterval: 5000,
  });
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

// Resumo do lote (conciliado x pendente, valores) por cliente/competência.
export function useReconciliationSummaryQuery(params: { clienteId?: string; competencia?: string }) {
  return useQuery({
    queryKey: [KEY, 'summary', params],
    queryFn: () => reconciliationApi.summary(params),
    enabled: !!params.clienteId,
    refetchInterval: 5000,
  });
}

export function useConfirmBatchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itens: BatchConfirmItem[]) => reconciliationApi.confirmBatch(itens),
    onSuccess: (res) => {
      notifySuccess(`${res.length} conciliação(ões) confirmada(s).`);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useRejectBatchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reconciliationApi.rejectBatch(ids),
    onSuccess: (res) => {
      notifySuccess(`${res.length} conciliação(ões) rejeitada(s).`);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

// Pareamento N:1 (agrupamento): casa várias movimentações do sistema com o extrato.
export function useGroupMatchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, movementIds }: { id: string; movementIds: string[] }) =>
      reconciliationApi.groupMatch(id, movementIds),
    onSuccess: () => {
      notifySuccess('Movimentações agrupadas.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
