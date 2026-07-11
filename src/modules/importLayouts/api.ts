import { api } from '@/shared/lib/api';
import type {
  ImportLayoutRequest,
  ImportLayoutResponse,
  PreviewRequest,
  PreviewResponse,
} from './types';

export const importLayoutsApi = {
  list: () => api.get<ImportLayoutResponse[]>('/import-layouts').then((r) => r.data),
  create: (body: ImportLayoutRequest) =>
    api.post<ImportLayoutResponse>('/import-layouts', body).then((r) => r.data),
  update: (id: string, body: ImportLayoutRequest) =>
    api.put<ImportLayoutResponse>(`/import-layouts/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/import-layouts/${id}`),
  preview: (body: PreviewRequest) =>
    api.post<PreviewResponse>('/import-layouts/preview', body).then((r) => r.data),
};
