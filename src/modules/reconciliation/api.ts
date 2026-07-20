import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  BatchConfirmItem,
  ConciliacaoResponse,
  ConfirmRequest,
  CreateConciliacaoRequest,
  ReconciliationProfileRequest,
  ReconciliationProfileResponse,
  ReconciliationResponse,
  ReconciliationSummary,
} from './types';

export const reconciliationApi = {
  pending: (params: PageParams & { clienteId?: string; competencia?: string }) =>
    api.get<Page<ReconciliationResponse>>('/reconciliations/pending', { params }).then((r) => r.data),
  history: (params: PageParams & { status?: string; clienteId?: string; competencia?: string }) =>
    api.get<Page<ReconciliationResponse>>('/reconciliations/history', { params }).then((r) => r.data),
  confirm: (id: string, body: ConfirmRequest) =>
    api.post<ReconciliationResponse>(`/reconciliations/${id}/confirm`, body).then((r) => r.data),
  reject: (id: string) =>
    api.post<ReconciliationResponse>(`/reconciliations/${id}/reject`).then((r) => r.data),
  confirmBatch: (itens: BatchConfirmItem[]) =>
    api
      .post<ReconciliationResponse[]>('/reconciliations/confirm-batch', { itens })
      .then((r) => r.data),
  rejectBatch: (ids: string[]) =>
    api.post<ReconciliationResponse[]>('/reconciliations/reject-batch', { ids }).then((r) => r.data),
  summary: (params: { clienteId?: string; competencia?: string }) =>
    api.get<ReconciliationSummary>('/reconciliations/summary', { params }).then((r) => r.data),
  groupMatch: (id: string, movementIds: string[]) =>
    api
      .post<ReconciliationResponse>(`/reconciliations/${id}/group-match`, { movementIds })
      .then((r) => r.data),
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
