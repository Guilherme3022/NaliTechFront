export interface ChartAccountResponse {
  id: string;
  codigo: string;
  nome: string;
  tipo: string | null;
  categoryId: string | null;
  parentId: string | null;
}

export interface ChartAccountRequest {
  codigo: string;
  nome: string;
  tipo?: string;
  categoryId?: string | null;
  parentId?: string | null;
}

export interface AccountRuleResponse {
  id: string;
  nome: string;
  descricaoContains: string | null;
  valorOperador: string | null;
  valorRef: number | null;
  contaId: string | null;
  marcarRevisao: boolean;
  prioridade: number;
  ativo: boolean;
}

export interface AccountRuleRequest {
  nome: string;
  descricaoContains?: string;
  valorOperador?: string;
  valorRef?: number | null;
  contaId?: string | null;
  marcarRevisao: boolean;
  prioridade: number;
  ativo: boolean;
}

// Sugestão de classificação de uma movimentação.
export interface SuggestionResponse {
  movementId: string;
  contaSugerida: string | null;
  confianca: number | null;
  origem: string | null;
}
