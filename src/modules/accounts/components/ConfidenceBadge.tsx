import { Chip } from '@mui/material';

// Indicador visual de confiança (E9.3):
// verde ≥80%, amarelo 40-79%, vermelho <40%.
export function ConfidenceBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <Chip size="small" label="—" variant="outlined" />;
  const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
  const color = pct >= 80 ? 'success' : pct >= 40 ? 'warning' : 'error';
  return <Chip size="small" color={color} label={`${pct}%`} />;
}
