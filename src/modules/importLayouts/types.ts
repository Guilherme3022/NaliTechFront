export interface ImportLayoutResponse {
  id: string;
  nome: string;
  colData: string | null;
  colValor: string | null;
  colDescricao: string | null;
  colDocumento: string | null;
  ativo: boolean;
  clienteId: string | null;
}

export interface ImportLayoutRequest {
  nome: string;
  colData?: string | null;
  colValor?: string | null;
  colDescricao?: string | null;
  colDocumento?: string | null;
  ativo: boolean;
  clienteId?: string | null;
}

export interface PreviewRequest {
  conteudo: string;
  colData?: string | null;
  colValor?: string | null;
  colDescricao?: string | null;
  colDocumento?: string | null;
}

export interface RawMovement {
  data: string | null;
  valor: string | null;
  descricao: string | null;
  documento: string | null;
}

export interface PreviewResponse {
  total: number;
  linhas: RawMovement[];
}
