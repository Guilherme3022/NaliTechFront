export type ClientStatus = 'ATIVO' | 'INATIVO';

export interface ClientResponse {
  id: string;
  nome: string;
  cnpjCpf: string;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  status: ClientStatus;
}

export interface ClientDocumentResponse {
  id: string;
  fileId: string;
  descricao: string | null;
  createdAt: string;
}

export interface CreateClientRequest {
  nome: string;
  cnpjCpf: string;
  contato?: string;
  telefone?: string;
  email?: string;
}

export interface UpdateClientRequest {
  nome: string;
  contato?: string;
  telefone?: string;
  email?: string;
  status: ClientStatus;
}
