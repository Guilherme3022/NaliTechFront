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
