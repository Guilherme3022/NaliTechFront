import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { MovementResponse, UpdateMovementRequest } from './types';

export const movementsApi = {
  list: (params: PageParams & { clienteId?: string; competencia?: string }) =>
    api.get<Page<MovementResponse>>('/movements', { params }).then((r) => r.data),
  update: (id: string, body: UpdateMovementRequest) =>
    api.put<MovementResponse>(`/movements/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/movements/${id}`),
};
