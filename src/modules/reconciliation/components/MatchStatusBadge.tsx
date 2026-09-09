import { Chip } from '@mui/material';
import type { ReconciliationResponse, ReconciliationStatus } from '../types';

// Rotulo curto da camada que gerou o match (EXATA, IA, APROXIMADA...).
function camadaLabel(camada: string | null): string | null {
  switch (camada) {
    case 'EXATA':
      return 'Exata';
    case 'SIMILARIDADE':
      return 'Similar';
    case 'REGRA':
      return 'Regra';
    case 'APROXIMADA':
      return 'Aprox.';
    case 'IA':
      return 'IA';
    default:
      return null;
  }
}

// confirmado / sugerido / pendente. "Sugerido" = pendente mas com match encontrado.
// Sugestoes da IA ganham destaque (cor secondary) para o contador priorizar a revisao.
export function MatchStatusBadge({ item }: { item: ReconciliationResponse }) {
  if (item.status === 'PENDENTE' && item.matchedMovementId) {
    const camada = camadaLabel(item.camada);
    const isIa = item.camada === 'IA';
    return (
      <Chip
        size="small"
        label={camada ? `Sugerido · ${camada}` : 'Sugerido'}
        color={isIa ? 'secondary' : 'warning'}
        variant="outlined"
      />
    );
  }
  const map: Record<ReconciliationStatus, { label: string; color: 'success' | 'warning' | 'default' | 'error' }> = {
    CONFIRMADO: { label: 'Confirmado', color: 'success' },
    PENDENTE: { label: 'Pendente', color: 'default' },
    REJEITADO: { label: 'Rejeitado', color: 'error' },
  };
  const { label, color } = map[item.status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
