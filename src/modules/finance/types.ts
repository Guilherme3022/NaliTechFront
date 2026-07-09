export type InvoiceStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export interface FeeResponse {
  id: string;
  clienteId: string;
  descricao: string | null;
  valor: number;
  periodicidade: string | null;
  ativo: boolean;
}

export interface CreateFeeRequest {
  clienteId: string;
  descricao?: string;
  valor: number;
  periodicidade?: string;
}

export interface InvoiceResponse {
  id: string;
  clienteId: string;
  valor: number;
  vencimento: string;
  status: InvoiceStatus;
  provider: string | null;
  externalId: string | null;
  boletoUrl: string | null;
  pixCopiaCola: string | null;
}

export interface CreateInvoiceRequest {
  clienteId: string;
  feeId?: string;
  valor: number;
  vencimento: string;
  descricao?: string;
}
