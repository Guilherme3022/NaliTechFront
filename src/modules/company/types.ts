export type CompanyStatus = 'ATIVA' | 'SUSPENSA' | 'CANCELADA';

export interface CompanyResponse {
  id: string;
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual: string | null;
  regimeTributario: string | null;
  plano: string | null;
  logoUrl: string | null;
  responsavelId: string | null;
  status: CompanyStatus;
}

export interface CreateCompanyRequest {
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string;
  regimeTributario?: string;
  plano?: string;
}

export interface UpdateCompanyRequest {
  razaoSocial: string;
  inscricaoEstadual?: string;
  regimeTributario?: string;
  plano?: string;
  status: CompanyStatus;
  responsavelId?: string | null;
}
