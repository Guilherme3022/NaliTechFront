import { api } from '@/shared/lib/api';
import type {
  AplicarModeloResponse,
  ContaRequest,
  CreatePlanoModeloRequest,
  PlanoModeloResponse,
} from './types';

export const planoModelosApi = {
  list: () => api.get<PlanoModeloResponse[]>('/plano-modelos').then((r) => r.data),
  get: (id: string) => api.get<PlanoModeloResponse>(`/plano-modelos/${id}`).then((r) => r.data),
  create: (body: CreatePlanoModeloRequest) =>
    api.post<PlanoModeloResponse>('/plano-modelos', body).then((r) => r.data),
  addConta: (id: string, body: ContaRequest) =>
    api.post<PlanoModeloResponse>(`/plano-modelos/${id}/contas`, body).then((r) => r.data),
  aplicar: (id: string, clienteId: string) =>
    api.post<AplicarModeloResponse>(`/plano-modelos/${id}/aplicar`, { clienteId }).then((r) => r.data),
  remove: (id: string) => api.delete(`/plano-modelos/${id}`),
};
