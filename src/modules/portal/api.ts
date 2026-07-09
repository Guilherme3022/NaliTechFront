import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { UploadResponse } from '@/modules/uploads/types';

export const portalApi = {
  upload: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<UploadResponse>('/portal/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      })
      .then((r) => r.data);
  },
  status: (params: PageParams) =>
    api.get<Page<UploadResponse>>('/portal/status', { params }).then((r) => r.data),
};
