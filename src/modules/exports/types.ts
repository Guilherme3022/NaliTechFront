export interface LayoutExport {
  id: string;
  sistema: string;
  periodoInicio: string;
  periodoFim: string;
  fileId: string | null;
  quantidade: number;
  createdAt?: string;
}

export interface ExportParams {
  sistema: string;
  inicio: string; // yyyy-MM-dd
  fim: string;
}

// Increment 6 — validação pré-export.
export interface ExportIssue {
  movementId: string;
  data: string | null;
  valor: number | null;
  descricao: string | null;
  motivo: string;
}

export interface ExportValidationReport {
  total: number;
  comProblema: number;
  problemas: ExportIssue[];
}
