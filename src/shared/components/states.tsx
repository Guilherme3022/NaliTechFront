import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxIcon from '@mui/icons-material/Inbox';
import type { ReactNode } from 'react';

// Estados de UI obrigatórios (skill frontend): loading, vazio, erro.

export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1} sx={{ py: 1 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={48} animation="wave" />
      ))}
    </Stack>
  );
}

export function EmptyState({
  title = 'Nada por aqui ainda',
  description,
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
        {icon ?? <InboxIcon fontSize="large" />}
      </Box>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}

export function ErrorState({
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <ErrorOutlineIcon color="error" fontSize="large" />
      <Typography variant="h6" sx={{ mt: 1 }}>
        Algo deu errado
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Box>
  );
}
