export type ReconciliationStatus = 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO';

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
}

export interface ConfirmRequest {
  contaSugerida?: string;
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
