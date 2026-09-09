import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  AiSweepJob,
  ConciliacaoResponse,
  ConfirmRequest,
  CreateConciliacaoRequest,
  ReconciliationProfileRequest,
  ReconciliationProfileResponse,
  ReconciliationResponse,
  ReprocessResponse,
} from './types';

type ReconFilter = { clienteId?: string; competencia?: string };

export const reconciliationApi = {
  pending: (params: PageParams & { clienteId?: string; competencia?: string }) =>
    api.get<Page<ReconciliationResponse>>('/reconciliations/pending', { params }).then((r) => r.data),
  history: (params: PageParams & { status?: string; clienteId?: string; competencia?: string }) =>
    api.get<Page<ReconciliationResponse>>('/reconciliations/history', { params }).then((r) => r.data),
  confirm: (id: string, body: ConfirmRequest) =>
    api.post<ReconciliationResponse>(`/reconciliations/${id}/confirm`, body).then((r) => r.data),
  reject: (id: string) =>
    api.post<ReconciliationResponse>(`/reconciliations/${id}/reject`).then((r) => r.data),
  // Reprocessa as pendencias MANUAL aplicando regras novas (sem IA).
  reprocess: (params: ReconFilter) =>
    api.post<ReprocessResponse>('/reconciliations/reprocess', null, { params }).then((r) => r.data),
  // Varredura por IA (assincrona) das pendencias MANUAL.
  startAiSweep: (params: ReconFilter) =>
    api.post<AiSweepJob>('/reconciliations/ai-sweep', null, { params }).then((r) => r.data),
  aiSweepStatus: (jobId: string) =>
    api.get<AiSweepJob>(`/reconciliations/ai-sweep/${jobId}`).then((r) => r.data),
  aiSweepActive: () =>
    api.get<AiSweepJob[]>('/reconciliations/ai-sweep').then((r) => r.data),
};

// Conciliacao como lote/processo mensal (spec secoes 9-12).
export const conciliacoesApi = {
  list: (params: { clienteId?: string; competencia?: string }) =>
    api.get<ConciliacaoResponse[]>('/conciliacoes', { params }).then((r) => r.data),
  create: (body: CreateConciliacaoRequest) =>
    api.post<ConciliacaoResponse>('/conciliacoes', body).then((r) => r.data),
  getById: (id: string) =>
    api.get<ConciliacaoResponse>(`/conciliacoes/${id}`).then((r) => r.data),
  attachUpload: (id: string, uploadId: string) =>
    api.post<ConciliacaoResponse>(`/conciliacoes/${id}/uploads/${uploadId}`).then((r) => r.data),
  concluir: (id: string) =>
    api.post<ConciliacaoResponse>(`/conciliacoes/${id}/concluir`).then((r) => r.data),
  cancelar: (id: string) =>
    api.post<ConciliacaoResponse>(`/conciliacoes/${id}/cancelar`).then((r) => r.data),
  download: (id: string, formato: string) =>
    api
      .get(`/conciliacoes/${id}/download`, { params: { formato }, responseType: 'blob' })
      .then((r) => r.data as Blob),
};

// Perfil de Conciliacao (spec secao 8).
export const reconciliationProfilesApi = {
  list: (clienteId?: string) =>
    api
      .get<ReconciliationProfileResponse[]>('/reconciliation-profiles', { params: { clienteId } })
      .then((r) => r.data),
  create: (body: ReconciliationProfileRequest) =>
    api.post<ReconciliationProfileResponse>('/reconciliation-profiles', body).then((r) => r.data),
  update: (id: string, body: ReconciliationProfileRequest) =>
    api.put<ReconciliationProfileResponse>(`/reconciliation-profiles/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/reconciliation-profiles/${id}`),
};
