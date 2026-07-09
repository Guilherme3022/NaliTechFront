import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { ObligationRequest, ObligationResponse } from './types';

export const fiscalApi = {
  list: (params: PageParams) =>
    api.get<Page<ObligationResponse>>('/fiscal-obligations', { params }).then((r) => r.data),
  upcoming: (dias = 7) =>
    api.get<ObligationResponse[]>('/fiscal-obligations/upcoming', { params: { dias } }).then((r) => r.data),
  create: (body: ObligationRequest) =>
    api.post<ObligationResponse>('/fiscal-obligations', body).then((r) => r.data),
  update: (id: string, body: ObligationRequest) =>
    api.put<ObligationResponse>(`/fiscal-obligations/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/fiscal-obligations/${id}`),
};
