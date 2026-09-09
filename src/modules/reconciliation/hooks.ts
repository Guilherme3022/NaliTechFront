import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifyInfo, notifySuccess } from '@/shared/lib/notify';
import { conciliacoesApi, reconciliationApi, reconciliationProfilesApi } from './api';
import type {
  AiSweepJob,
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

// Reprocessa as pendências MANUAL aplicando regras novas (grátis, sem IA).
export function useReprocessMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { clienteId?: string; competencia?: string }) =>
      reconciliationApi.reprocess(params),
    onSuccess: (res) => {
      notifySuccess(
        res.reprocessados === 0
          ? 'Nenhuma pendência para reprocessar.'
          : `Reprocessadas ${res.reprocessados} — ${res.resolvidos} conciliada(s).`,
      );
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

// Dispara a varredura por IA das pendências MANUAL (assíncrona).
export function useStartAiSweepMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { clienteId?: string; competencia?: string }) =>
      reconciliationApi.startAiSweep(params),
    onSuccess: (job: AiSweepJob) => {
      if (job.status === 'SEM_PENDENCIAS') {
        notifyInfo('Não há pendências novas para a IA analisar.');
      } else {
        notifyInfo(`IA analisando ${job.total} pendência(s)…`);
      }
      qc.invalidateQueries({ queryKey: [KEY, 'ai-sweep', 'active'] });
    },
  });
}

// Jobs de IA ativos/recentes da empresa (para o popup). Faz polling enquanto
// houver algum job EXECUTANDO; caso contrário, para (o start reativa via invalidate).
export function useAiSweepActiveQuery() {
  return useQuery({
    queryKey: [KEY, 'ai-sweep', 'active'],
    queryFn: () => reconciliationApi.aiSweepActive(),
    refetchInterval: (query) => {
      const data = query.state.data as AiSweepJob[] | undefined;
      return data?.some((j) => j.status === 'EXECUTANDO') ? 2000 : false;
    },
  });
}
