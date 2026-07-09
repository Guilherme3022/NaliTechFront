export type UploadStatus = 'RECEBIDO' | 'VALIDANDO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

export interface UploadResponse {
  id: string;
  fileId: string | null;
  clienteId: string | null;
  nomeOriginal: string;
  tipoMime: string;
  tamanho: number;
  status: UploadStatus;
  etapaAtual: string | null;
  erroMensagem: string | null;
  createdAt: string;
}
