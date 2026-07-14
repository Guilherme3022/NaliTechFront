export type MovementStatus =
  | 'NORMALIZADO'
  | 'CONCILIACAO_PENDENTE'
  | 'CONCILIADO'
  | 'CLASSIFICADO';

export interface MovementResponse {
  id: string;
  clienteId: string | null;
  data: string | null;
  valor: number | null;
  descricao: string | null;
  tipo: string | null;
  documento: string | null;
  banco: string | null;
  contaDebitoId: string | null;
  contaCreditoId: string | null;
  status: MovementStatus;
}

export interface UpdateMovementRequest {
  data?: string | null;
  valor?: number | null;
  descricao?: string | null;
  documento?: string | null;
  contaDebitoId?: string | null;
  contaCreditoId?: string | null;
}
