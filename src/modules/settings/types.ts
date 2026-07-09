export interface SubscriptionResponse {
  id: string;
  evento: string;
  urlDestino: string;
  ativo: boolean;
  segredo: string;
}

export interface CreateSubscriptionRequest {
  evento: string;
  urlDestino: string;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  evento: string;
  payload: string | null;
  httpStatus: number | null;
  tentativa: number;
  sucesso: boolean;
  erro: string | null;
  createdAt?: string;
}

export interface ApiKeyResponse {
  id: string;
  nome: string;
  escopos: string | null;
  ativo: boolean;
  ultimoUso: string | null;
}

export interface CreatedApiKeyResponse {
  id: string;
  nome: string;
  escopos: string | null;
  chave: string; // exibida uma única vez
}

export interface CreateApiKeyRequest {
  nome: string;
  escopos?: string;
}

// Catálogo fixo de eventos disponíveis (ver 02-backend.md).
export const WEBHOOK_EVENTS = [
  'upload.recebido',
  'upload.processado',
  'upload.erro',
  'conciliacao.pendente',
  'conciliacao.confirmada',
  'exportacao.gerada',
  'obrigacao.vencendo',
  'cobranca.criada',
  'cobranca.paga',
  'cobranca.vencida',
] as const;
