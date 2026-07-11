import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { ExportParams, ExportValidationReport, LayoutExport } from './types';

export const exportsApi = {
  sistemas: () => api.get<string[]>('/layouts').then((r) => r.data),
  history: (params: PageParams) =>
    api.get<Page<LayoutExport>>('/layouts/exports/history', { params }).then((r) => r.data),
  validate: (inicio: string, fim: string) =>
    api
      .get<ExportValidationReport>('/layouts/validation', { params: { inicio, fim } })
      .then((r) => r.data),
  // O endpoint devolve o arquivo (bytes). Baixamos como blob e disparamos o download.
  export: async ({ sistema, inicio, fim }: ExportParams) => {
    const response = await api.post(`/layouts/${sistema}/export`, null, {
      params: { inicio, fim },
      responseType: 'blob',
    });
    const disposition = response.headers['content-disposition'] as string | undefined;
    const match = disposition?.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] ?? `export-${sistema}-${inicio}.txt`;

    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
};
