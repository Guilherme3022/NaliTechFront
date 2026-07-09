import { Chip } from '@mui/material';
import type { InvoiceStatus } from '../types';

const MAP: Record<InvoiceStatus, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
  PENDENTE: { label: 'Pendente', color: 'warning' },
  PAGO: { label: 'Pago', color: 'success' },
  VENCIDO: { label: 'Atrasado', color: 'error' },
  CANCELADO: { label: 'Cancelado', color: 'default' },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, color } = MAP[status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
