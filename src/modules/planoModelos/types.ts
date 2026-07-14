export interface PlanoModeloConta {
  id: string;
  codigo: string;
  nome: string;
  tipo: string | null;
}

export interface PlanoModeloResponse {
  id: string;
  nome: string;
  descricao: string | null;
  contas: PlanoModeloConta[];
}

export interface CreatePlanoModeloRequest {
  nome: string;
  descricao?: string;
}

export interface ContaRequest {
  codigo: string;
  nome: string;
  tipo?: string;
}

export interface AplicarModeloResponse {
  contasCriadas: number;
  contasIgnoradas: number;
}
