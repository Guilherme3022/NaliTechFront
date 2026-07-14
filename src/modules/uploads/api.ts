import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { UploadResponse } from './types';

export const uploadsApi = {
  list: (params: PageParams & { clienteId?: string; status?: string }) =>
    api.get<Page<UploadResponse>>('/uploads', { params }).then((r) => r.data),
  getById: (id: string) => api.get<UploadResponse>(`/uploads/${id}`).then((r) => r.data),
  remove: (id: string) => api.delete(`/uploads/${id}`),
  substitute: (id: string, file: File, justificativa?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (justificativa) form.append('justificativa', justificativa);
    return api
      .post<UploadResponse>(`/uploads/${id}/substituir`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  upload: (file: File, clienteId?: string, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    if (clienteId) form.append('clienteId', clienteId);
    return api
      .post<UploadResponse>('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      })
      .then((r) => r.data);
  },
};
