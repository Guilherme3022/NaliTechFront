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
