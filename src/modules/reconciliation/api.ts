import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { ConfirmRequest, ReconciliationResponse } from './types';

export const reconciliationApi = {
  pending: (params: PageParams & { clienteId?: string; competencia?: string }) =>
    api.get<Page<ReconciliationResponse>>('/reconciliations/pending', { params }).then((r) => r.data),
  history: (params: PageParams & { status?: string; clienteId?: string; competencia?: string }) =>
    api.get<Page<ReconciliationResponse>>('/reconciliations/history', { params }).then((r) => r.data),
  confirm: (id: string, body: ConfirmRequest) =>
    api.post<ReconciliationResponse>(`/reconciliations/${id}/confirm`, body).then((r) => r.data),
  reject: (id: string) =>
    api.post<ReconciliationResponse>(`/reconciliations/${id}/reject`).then((r) => r.data),
};
