import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  ClientDocumentResponse,
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from './types';

export const clientsApi = {
  list: (params: PageParams & { search?: string }) =>
    api.get<Page<ClientResponse>>('/clients', { params }).then((r) => r.data),
  getById: (id: string) => api.get<ClientResponse>(`/clients/${id}`).then((r) => r.data),
  documents: (id: string) =>
    api.get<ClientDocumentResponse[]>(`/clients/${id}/documents`).then((r) => r.data),
  create: (body: CreateClientRequest) =>
    api.post<ClientResponse>('/clients', body).then((r) => r.data),
  update: (id: string, body: UpdateClientRequest) =>
    api.put<ClientResponse>(`/clients/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/clients/${id}`),
};
