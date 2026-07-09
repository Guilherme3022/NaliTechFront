export type ReconciliationStatus = 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO';

export interface ReconciliationResponse {
  id: string;
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
