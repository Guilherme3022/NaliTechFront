import { useState } from 'react';
import { Box, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatDateTime } from '@/shared/lib/format';
import { useWebhookDeliveriesQuery } from '../hooks';
import type { WebhookDelivery } from '../types';

// E17.3 — log de entregas por assinatura, com "ver payload enviado".
export function WebhookDeliveryLog({ subscriptionId }: { subscriptionId: string }) {
  const { page, size, setPage, setSize } = usePagination();
  const query = useWebhookDeliveriesQuery(subscriptionId, { page, size });
  const [payload, setPayload] = useState<string | null>(null);

  const columns: Column<WebhookDelivery>[] = [
    { key: 'createdAt', label: 'Data', render: (d) => formatDateTime(d.createdAt) },
    { key: 'evento', label: 'Evento' },
    {
      key: 'sucesso',
      label: 'Resultado',
      render: (d) => (
        <Chip
          size="small"
          label={d.sucesso ? 'Sucesso' : 'Falha'}
          color={d.sucesso ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    { key: 'httpStatus', label: 'HTTP', render: (d) => d.httpStatus ?? '—' },
    { key: 'tentativa', label: 'Tentativa', align: 'right' },
    {
      key: 'payload',
      label: '',
      align: 'right',
      render: (d) => (
        <Tooltip title="Ver payload enviado">
          <IconButton size="small" onClick={() => setPayload(d.payload ?? '(vazio)')}>
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={query.data?.content ?? []}
        rowKey={(d) => d.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhuma entrega registrada para esta assinatura ainda."
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
      <Dialog open={!!payload} onClose={() => setPayload(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Payload enviado</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{ p: 2, bgcolor: '#0d1117', color: '#c9d1d9', borderRadius: 1, fontSize: 12, overflow: 'auto' }}
          >
            {payload}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
