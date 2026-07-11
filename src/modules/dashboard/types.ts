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

// Increment 8 — visão operacional + carteira.
export interface OperationSummary {
  clientesAtivos: number;
  conciliacoesPendentes: number;
  aguardandoClassificacao: number;
  uploadsProcessando: number;
  uploadsComErro: number;
}

export interface PortfolioItem {
  clienteId: string;
  nome: string;
  pendentesConciliacao: number;
  aguardandoClassificacao: number;
}

export interface DashboardPortfolio {
  clientes: PortfolioItem[];
}
