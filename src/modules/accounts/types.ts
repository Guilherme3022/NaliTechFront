export interface ChartAccountResponse {
  id: string;
  codigo: string;
  nome: string;
  tipo: string | null;
  // true = analítica (lançável); false = sintética (agrupadora); null = indefinida.
  analitica: boolean | null;
  // Natureza de saldo: 'DEVEDORA' | 'CREDORA' | null (o que o D-/C- legado indicava).
  naturezaSaldo: string | null;
  categoryId: string | null;
  parentId: string | null;
  clienteId: string | null;
}

export interface ChartAccountRequest {
  codigo: string;
  nome: string;
  tipo?: string;
  analitica?: boolean | null;
  naturezaSaldo?: string | null;
  categoryId?: string | null;
  parentId?: string | null;
  clienteId?: string | null;
}

// Importação de plano de contas (TXT D-/C-, CSV ou Excel) com prévia e seleção.
export interface ImportResult {
  contasCriadas: number;
  contasIgnoradas: number;
}

export interface ChartImportPreviewItem {
  codigo: string;
  nome: string;
  tipo: string | null;
  // Natureza estrutural: SINTETICA | ANALITICA | INDEFINIDA.
  natureza: string | null;
  analitica: boolean | null;
  // Natureza de saldo: 'DEVEDORA' | 'CREDORA' | null.
  naturezaSaldo: string | null;
  portador: boolean;
  jaExiste: boolean;
  importavel: boolean;
}

export interface ChartImportConfirmItem {
  codigo: string;
  nome: string;
  tipo?: string | null;
  analitica?: boolean | null;
  naturezaSaldo?: string | null;
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
  clienteId: string | null;
  centroCustoId: string | null;
  filialId: string | null;
  tipoMovimento: string | null;
  bancoContains: string | null;
  documentoContains: string | null;
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
  clienteId?: string | null;
  centroCustoId?: string | null;
  filialId?: string | null;
  tipoMovimento?: string | null;
  bancoContains?: string | null;
  documentoContains?: string | null;
}

// Increment 4 — Centro de custo.
export interface CostCenterResponse {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  clienteId: string | null;
}

export interface CostCenterRequest {
  codigo: string;
  nome: string;
  ativo: boolean;
  clienteId?: string | null;
}

// Increment 5 — Filiais.
export interface BranchResponse {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
  clienteId: string | null;
}

export interface BranchRequest {
  codigo: string;
  nome: string;
  cnpj?: string | null;
  ativo: boolean;
  clienteId?: string | null;
}

// Increment 7 — Contratos de financiamento/empréstimo.
export interface LoanContractResponse {
  id: string;
  descricao: string;
  valorTotal: number | null;
  taxaJuros: number | null;
  parcelas: number | null;
  contaPrincipalId: string | null;
  contaJurosId: string | null;
  contaEncargosId: string | null;
  classificacaoPrazo: string | null;
  ativo: boolean;
  clienteId: string | null;
}

export interface LoanContractRequest {
  descricao: string;
  valorTotal?: number | null;
  taxaJuros?: number | null;
  parcelas?: number | null;
  contaPrincipalId?: string | null;
  contaJurosId?: string | null;
  contaEncargosId?: string | null;
  classificacaoPrazo?: string | null;
  ativo: boolean;
  clienteId?: string | null;
}

// Sugestão de classificação de uma movimentação.
export interface SuggestionResponse {
  movementId: string;
  contaSugerida: string | null;
  confianca: number | null;
  origem: string | null;
}

// Increment 1 — Parametrização De/Para.
export interface ParametrizationRequest {
  descricaoPadrao: string;
  exemplo: string;
  ocorrencias: number;
  valorTotal: number;
}

export interface ApplyParametrizationRequest {
  descricaoContains: string;
  contaId: string;
  criarRegra: boolean;
}

export interface ApplyParametrizationResponse {
  classificados: number;
  regraCriada: boolean;
}

// Increment 2 — Partida dobrada / contas bancárias.
export interface BankAccountResponse {
  id: string;
  nome: string;
  contaContabilId: string;
  padrao: boolean;
  clienteId: string | null;
}

export interface BankAccountRequest {
  nome: string;
  contaContabilId: string;
  padrao: boolean;
  clienteId?: string | null;
}

export interface ManualEntryRequest {
  contaDebitoId: string;
  contaCreditoId: string;
}
