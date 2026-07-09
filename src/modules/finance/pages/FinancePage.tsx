import { useState } from 'react';
import { Alert, Box, Button, Chip, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { useClientName } from '@/modules/clients/useClientName';
import {
  useOfficeFeesQuery,
  useOfficeInvoicesQuery,
  useOverdueReceivablesQuery,
} from '../hooks';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { FeeFormDialog } from '../components/FeeFormDialog';
import { InvoiceFormDialog } from '../components/InvoiceFormDialog';
import type { FeeResponse, InvoiceResponse } from '../types';

export function FinancePage() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <PageHeader title="Financeiro do escritório" subtitle="Honorários, cobranças e inadimplência" />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Honorários" />
          <Tab label="Cobranças" />
          <Tab label="Inadimplência" />
        </Tabs>
      </Box>
      {tab === 0 && <FeesTab />}
      {tab === 1 && <InvoicesTab />}
      {tab === 2 && <OverdueTab />}
    </>
  );
}

function FeesTab() {
  const query = useOfficeFeesQuery();
  const clientName = useClientName();
  const [open, setOpen] = useState(false);

  const columns: Column<FeeResponse>[] = [
    { key: 'clienteId', label: 'Cliente', render: (f) => clientName(f.clienteId) },
    { key: 'descricao', label: 'Descrição', render: (f) => f.descricao ?? '—' },
    { key: 'valor', label: 'Valor', align: 'right', render: (f) => formatCurrency(f.valor) },
    { key: 'periodicidade', label: 'Periodicidade', render: (f) => f.periodicidade ?? '—' },
    {
      key: 'ativo',
      label: 'Status',
      render: (f) => (
        <Chip size="small" label={f.ativo ? 'Ativo' : 'Inativo'} color={f.ativo ? 'success' : 'default'} variant="outlined" />
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Novo honorário
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={query.data ?? []}
        rowKey={(f) => f.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhum honorário cadastrado."
      />
      <FeeFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function InvoicesTab() {
  const navigate = useNavigate();
  const clientName = useClientName();
  const { page, size, setPage, setSize } = usePagination();
  const query = useOfficeInvoicesQuery({ page, size });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const rows = (query.data?.content ?? []).filter(
    (i) => statusFilter === 'TODOS' || i.status === statusFilter,
  );

  const columns: Column<InvoiceResponse>[] = [
    { key: 'clienteId', label: 'Cliente', render: (i) => clientName(i.clienteId) },
    { key: 'valor', label: 'Valor', align: 'right', render: (i) => formatCurrency(i.valor) },
    { key: 'vencimento', label: 'Vencimento', render: (i) => formatDate(i.vencimento) },
    { key: 'status', label: 'Status', render: (i) => <InvoiceStatusBadge status={i.status} /> },
    { key: 'provider', label: 'Gateway', render: (i) => i.provider ?? '—' },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (i) => (
        <Tooltip title="Ver detalhe (boleto/PIX)">
          <IconButton size="small" onClick={() => navigate(`/finance/invoices/${i.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['TODOS', 'PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'].map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              variant={statusFilter === s ? 'filled' : 'outlined'}
              color={statusFilter === s ? 'primary' : 'default'}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nova cobrança
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(i) => i.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        onRowClick={(i) => navigate(`/finance/invoices/${i.id}`)}
        emptyMessage="Nenhuma cobrança encontrada."
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
      <InvoiceFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function OverdueTab() {
  const query = useOverdueReceivablesQuery();
  const clientName = useClientName();
  const navigate = useNavigate();

  const columns: Column<InvoiceResponse>[] = [
    { key: 'clienteId', label: 'Cliente', render: (i) => clientName(i.clienteId) },
    { key: 'valor', label: 'Valor', align: 'right', render: (i) => formatCurrency(i.valor) },
    { key: 'vencimento', label: 'Venceu em', render: (i) => formatDate(i.vencimento) },
    { key: 'status', label: 'Status', render: (i) => <InvoiceStatusBadge status={i.status} /> },
  ];

  return (
    <>
      {(query.data ?? []).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {query.data!.length} cobrança(s) em atraso.
        </Alert>
      )}
      <DataTable
        columns={columns}
        rows={query.data ?? []}
        rowKey={(i) => i.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        onRowClick={(i) => navigate(`/finance/invoices/${i.id}`)}
        emptyMessage="Nenhum cliente em atraso. 🎉"
      />
    </>
  );
}
