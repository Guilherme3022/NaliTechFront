import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatDate } from '@/shared/lib/format';
import { useClientName } from '@/modules/clients/useClientName';
import { useDeleteObligationMutation, useFiscalObligationsQuery } from '../hooks';
import { ObligationFormDialog } from '../components/ObligationFormDialog';
import type { ObligationResponse, ObligationStatus } from '../types';

// Indicador visual "vence em breve" / "vencido" (E13.3).
function DueChip({ o }: { o: ObligationResponse }) {
  const map: Record<ObligationStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    CUMPRIDA: { label: 'Cumprida', color: 'success' },
    ATRASADA: { label: 'Atrasada', color: 'error' },
    PENDENTE: { label: 'Pendente', color: 'warning' },
  };
  const today = new Date();
  const due = new Date(o.vencimento);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (o.status === 'PENDENTE' && days < 0) return <Chip size="small" label="Vencido" color="error" />;
  if (o.status === 'PENDENTE' && days <= 3) return <Chip size="small" label={`Vence em ${days}d`} color="warning" />;
  const { label, color } = map[o.status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}

export function FiscalPage() {
  const { page, size, setPage, setSize } = usePagination(20, 'vencimento,asc');
  const query = useFiscalObligationsQuery({ page, size, sort: 'vencimento,asc' });
  const del = useDeleteObligationMutation();
  const clientName = useClientName();
  const [open, setOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<string>('TODOS');
  const [toDelete, setToDelete] = useState<ObligationResponse | null>(null);

  const rows = useMemo(() => {
    const all = query.data?.content ?? [];
    return clientFilter === 'TODOS' ? all : all.filter((o) => o.clienteId === clientFilter);
  }, [query.data, clientFilter]);

  const clientChips = useMemo(() => {
    const ids = new Set((query.data?.content ?? []).map((o) => o.clienteId).filter(Boolean) as string[]);
    return Array.from(ids);
  }, [query.data]);

  const columns: Column<ObligationResponse>[] = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'descricao', label: 'Descrição', render: (o) => o.descricao ?? '—' },
    { key: 'clienteId', label: 'Cliente', render: (o) => clientName(o.clienteId) },
    { key: 'vencimento', label: 'Vencimento', render: (o) => formatDate(o.vencimento) },
    { key: 'status', label: 'Situação', render: (o) => <DueChip o={o} /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (o) => (
        <Tooltip title="Remover">
          <IconButton size="small" onClick={() => setToDelete(o)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Agenda fiscal"
        subtitle="Obrigações por vencimento"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Nova obrigação
          </Button>
        }
      />

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="Todos os clientes"
          size="small"
          variant={clientFilter === 'TODOS' ? 'filled' : 'outlined'}
          color={clientFilter === 'TODOS' ? 'primary' : 'default'}
          onClick={() => setClientFilter('TODOS')}
        />
        {clientChips.map((cid) => (
          <Chip
            key={cid}
            label={clientName(cid)}
            size="small"
            variant={clientFilter === cid ? 'filled' : 'outlined'}
            color={clientFilter === cid ? 'primary' : 'default'}
            onClick={() => setClientFilter(cid)}
          />
        ))}
      </Box>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhuma obrigação cadastrada."
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />

      <ObligationFormDialog open={open} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover obrigação"
        message={`Remover a obrigação "${toDelete?.tipo}"?`}
        confirmLabel="Remover"
        confirmColor="error"
        loading={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await del.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}
