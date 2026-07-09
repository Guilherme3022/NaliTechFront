import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import type { ReconciliationResponse } from '../types';

// Visão lado a lado: movimentação do extrato x movimentação do sistema,
// com o indicador de match (score) ao centro.
export function ReconciliationSplitView({ item }: { item: ReconciliationResponse }) {
  const scorePct = item.score != null ? Math.round((item.score <= 1 ? item.score * 100 : item.score)) : null;
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
      <Paper variant="outlined" sx={{ flex: 1, p: 2, width: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          Extrato
        </Typography>
        <Typography variant="body2">Movimentação {item.movementId.slice(0, 8)}</Typography>
      </Paper>

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

      <Paper variant="outlined" sx={{ flex: 1, p: 2, width: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          Sistema
        </Typography>
        {item.matchedMovementId ? (
          <Typography variant="body2">Movimentação {item.matchedMovementId.slice(0, 8)}</Typography>
        ) : (
          <Box sx={{ color: 'text.disabled' }}>
            <Typography variant="body2">Sem correspondência sugerida</Typography>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
