export type MovementStatus =
  | 'NORMALIZADO'
  | 'CONCILIACAO_PENDENTE'
  | 'CONCILIADO'
  | 'CLASSIFICADO'
  | 'IGNORADO';

export interface MovementResponse {
  id: string;
  clienteId: string | null;
  data: string | null;
  valor: number | null;
  descricao: string | null;
  tipo: string | null;
  documento: string | null;
  banco: string | null;
  origem: 'EXTRATO' | 'SISTEMA' | null;
  contaDebitoId: string | null;
  contaCreditoId: string | null;
  status: MovementStatus;
}

export type MovementType = 'ENTRADA' | 'SAIDA';

export interface UpdateMovementRequest {
  data?: string | null;
  valor?: number | null;
  descricao?: string | null;
  documento?: string | null;
  contaDebitoId?: string | null;
  contaCreditoId?: string | null;
  // Correcao manual de entrada/saida (quando o OCR/parser erra a natureza).
  tipo?: MovementType | null;
}
