export type ObligationStatus = 'PENDENTE' | 'CUMPRIDA' | 'ATRASADA';

export interface ObligationResponse {
  id: string;
  clienteId: string | null;
  tipo: string;
  descricao: string | null;
  vencimento: string;
  status: ObligationStatus;
}

export interface ObligationRequest {
  clienteId?: string | null;
  tipo: string;
  descricao?: string;
  vencimento: string;
  status: ObligationStatus;
}
