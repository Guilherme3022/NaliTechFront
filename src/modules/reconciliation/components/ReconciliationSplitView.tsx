import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import type { MovementView, ReconciliationResponse } from '../types';

// Cartão de uma movimentação real (extrato ou sistema): data, valor, descrição.
function MovementCard({ label, mov }: { label: string; mov: MovementView | null }) {
  return (
    <Paper variant="outlined" sx={{ flex: 1, p: 2, width: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {mov ? (
        <>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {formatCurrency(mov.valor)}
            </Typography>
            {mov.tipo && (
              <Chip
                size="small"
                label={mov.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                color={mov.tipo === 'ENTRADA' ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {mov.descricao ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(mov.data)}
            {mov.banco ? ` · ${mov.banco}` : ''}
            {mov.documento ? ` · doc ${mov.documento}` : ''}
          </Typography>
        </>
      ) : (
        <Box sx={{ color: 'text.disabled', mt: 0.5 }}>
          <Typography variant="body2">Sem correspondência sugerida</Typography>
        </Box>
      )}
    </Paper>
  );
}

// Visão lado a lado: movimentação do extrato x movimentação do sistema,
// com o indicador de match (score) ao centro.
export function ReconciliationSplitView({ item }: { item: ReconciliationResponse }) {
  const scorePct =
    item.score != null ? Math.round(item.score <= 1 ? item.score * 100 : item.score) : null;
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
      <MovementCard label="Extrato" mov={item.movimento} />

      <Stack alignItems="center" spacing={0.5}>
        <CompareArrowsIcon color={item.matchedMovementId ? 'success' : 'disabled'} />
        {scorePct != null && (
          <Chip size="small" label={`${scorePct}%`} color={scorePct >= 70 ? 'success' : 'warning'} />
        )}
        {item.camada && (
          <Typography variant="caption" color="text.secondary">
            {item.camada}
          </Typography>
        )}
      </Stack>

      {item.agrupamento && item.agrupamento.length > 0 ? (
        <Paper variant="outlined" sx={{ flex: 1, p: 2, width: '100%' }}>
          <Typography variant="caption" color="text.secondary">
            Sistema · agrupamento ({item.agrupamento.length})
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {item.agrupamento.map((m) => (
              <Stack key={m.id} direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                  {m.descricao ?? '—'}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(m.valor)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      ) : (
        <MovementCard label="Sistema" mov={item.correspondencia} />
      )}
    </Stack>
  );
}
