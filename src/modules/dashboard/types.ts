import type { UploadStatus } from '@/modules/uploads/types';

export interface DashboardSummary {
  conciliacoesPendentes: number;
  uploadsHoje: number;
  uploadsComErro: number;
  movimentacoesConciliadas: number;
}

export interface ActivityItem {
  uploadId: string;
  status: UploadStatus;
  etapaAtual: string | null;
  quando: string;
}

export interface DashboardActivity {
  recentes: ActivityItem[];
}
