export interface AuditLog {
  id: string;
  usuarioId: string | null;
  empresaId: string | null;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  ip: string | null;
  userAgent: string | null;
  timestamp: string;
  detalhes: string | null;
}

export interface AuditFilters {
  usuarioId?: string;
  entidade?: string;
  inicio?: string; // ISO date-time
  fim?: string;
}
