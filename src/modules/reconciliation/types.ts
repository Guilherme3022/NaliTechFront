export type ReconciliationStatus = 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO';

// Dados reais de uma movimentação (extrato ou correspondência) para conferência visual.
export interface MovementView {
  id: string;
  data: string | null;
  valor: number | null;
  descricao: string | null;
  documento: string | null;
  banco: string | null;
  tipo: 'ENTRADA' | 'SAIDA' | null;
  status: string | null;
}

// Conta sugerida para o item, já com código/nome legíveis.
export interface SugestaoView {
  contaId: string;
  codigo: string | null;
  nome: string | null;
  confianca: number | null;
  origem: string | null;
}

export interface ReconciliationResponse {
  id: string;
  clienteId: string | null;
  competencia: string | null;
  movementId: string;
  matchedMovementId: string | null;
  status: ReconciliationStatus;
  camada: string | null;
  score: number | null;
  motivo: string | null;
  movimento: MovementView | null;
  correspondencia: MovementView | null;
  sugestao: SugestaoView | null;
  // Pareamento N:1: movimentações do sistema agrupadas contra o extrato.
  agrupamento: MovementView[] | null;
}

export interface ConfirmRequest {
  contaSugerida?: string;
}

export interface BatchConfirmItem {
  id: string;
  contaSugerida?: string | null;
}

export interface SummaryLine {
  status: ReconciliationStatus;
  quantidade: number;
  valorTotal: number;
}

export interface ReconciliationSummary {
  total: number;
  valorTotal: number;
  porStatus: SummaryLine[];
}

// Conciliacao como lote/processo mensal (spec secoes 9-12).
export type ConciliacaoSituacao =
  | 'RASCUNHO'
  | 'AGUARDANDO_ARQUIVO'
  | 'VALIDANDO'
  | 'AGUARDANDO_PARAMETRIZACAO'
  | 'COM_PENDENCIAS'
  | 'PRONTA_PARA_REVISAO'
  | 'EM_REVISAO'
  | 'CONCLUIDA'
  | 'CANCELADA';

export interface ConciliacaoResponse {
  id: string;
  clienteId: string;
  competencia: string;
  perfilId: string | null;
  situacao: ConciliacaoSituacao;
}

export interface CreateConciliacaoRequest {
  clienteId: string;
  competencia: string; // YYYY-MM
  perfilId?: string | null;
}

// Perfil de Conciliacao (spec secao 8).
export interface ReconciliationProfileResponse {
  id: string;
  clienteId: string;
  nome: string;
  sistemaOrigem: string | null;
  tipoArquivo: string | null;
  sistemaContabilDestino: string | null;
  planoId: string | null;
  ativo: boolean;
}

export interface ReconciliationProfileRequest {
  clienteId: string;
  nome: string;
  sistemaOrigem?: string;
  tipoArquivo?: string;
  sistemaContabilDestino?: string;
  planoId?: string | null;
  ativo?: boolean;
}
