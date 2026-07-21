export type UploadStatus = 'RECEBIDO' | 'VALIDANDO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

// Papel do documento: EXTRATO (banco) x SISTEMA (contas a pagar/receber).
export type OrigemDocumento = 'EXTRATO' | 'SISTEMA';

export interface UploadResponse {
  id: string;
  fileId: string | null;
  clienteId: string | null;
  origem: OrigemDocumento | null;
  bankAccountId: string | null;
  nomeOriginal: string;
  tipoMime: string;
  tamanho: number;
  status: UploadStatus;
  etapaAtual: string | null;
  erroMensagem: string | null;
  createdAt: string;
}
