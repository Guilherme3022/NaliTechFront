import { Chip } from '@mui/material';
import type { UploadStatus } from '../types';

const MAP: Record<UploadStatus, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  RECEBIDO: { label: 'Recebido', color: 'default' },
  VALIDANDO: { label: 'Validando', color: 'info' },
  PROCESSANDO: { label: 'Processando', color: 'warning' },
  CONCLUIDO: { label: 'Concluído', color: 'success' },
  ERRO: { label: 'Erro', color: 'error' },
};

export function UploadStatusChip({ status }: { status: UploadStatus }) {
  const { label, color } = MAP[status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
