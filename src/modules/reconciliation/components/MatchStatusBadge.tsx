import { Chip } from '@mui/material';
import type { ReconciliationResponse, ReconciliationStatus } from '../types';

// confirmado / sugerido / pendente. "Sugerido" = pendente mas com match encontrado.
export function MatchStatusBadge({ item }: { item: ReconciliationResponse }) {
  const map: Record<ReconciliationStatus, { label: string; color: 'success' | 'warning' | 'default' | 'error' }> = {
    CONFIRMADO: { label: 'Confirmado', color: 'success' },
    PENDENTE: { label: item.matchedMovementId ? 'Sugerido' : 'Pendente', color: item.matchedMovementId ? 'warning' : 'default' },
    REJEITADO: { label: 'Rejeitado', color: 'error' },
  };
  const { label, color } = map[item.status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
