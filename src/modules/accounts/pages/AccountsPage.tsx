import { useState } from 'react';
import { Box, Button, Card, Chip, IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import {
  useAccountRulesQuery,
  useChartOfAccountsQuery,
  useDeleteAccountRuleMutation,
  useDeleteChartAccountMutation,
} from '../hooks';
import { ChartAccountFormDialog } from '../components/ChartAccountFormDialog';
import { AccountRuleFormDialog } from '../components/AccountRuleFormDialog';
import type { AccountRuleResponse, ChartAccountResponse } from '../types';

export function AccountsPage() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <PageHeader title="Plano de contas" subtitle="Estrutura contábil e regras de classificação" />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Contas" />
          <Tab label="Motor de regras" />
        </Tabs>
      </Box>
      {tab === 0 ? <ChartTab /> : <RulesTab />}
    </>
  );
}

function ChartTab() {
  const { page, size, setPage, setSize } = usePagination(20, 'codigo,asc');
  const query = useChartOfAccountsQuery({ page, size, sort: 'codigo,asc' });
  const del = useDeleteChartAccountMutation();
  const [editing, setEditing] = useState<ChartAccountResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ChartAccountResponse | null>(null);

  // Hierarquia por indentação: contas com parentId ganham recuo.
  const columns: Column<ChartAccountResponse>[] = [
    {
      key: 'codigo',
      label: 'Código',
      render: (a) => (
        <span style={{ paddingLeft: a.parentId ? 24 : 0, fontWeight: a.parentId ? 400 : 600 }}>
          {a.codigo}
        </span>
      ),
    },
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo', render: (a) => a.tipo ?? '—' },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      render: (a) => (
        <>
          <IconButton size="small" onClick={() => { setEditing(a); setOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setToDelete(a)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setOpen(true); }}>
          Nova conta
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={query.data?.content ?? []}
        rowKey={(a) => a.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhuma conta cadastrada."
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
      <ChartAccountFormDialog open={open} account={editing} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover conta"
        message={`Remover a conta ${toDelete?.codigo}?`}
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

function RulesTab() {
  const query = useAccountRulesQuery();
  const del = useDeleteAccountRuleMutation();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AccountRuleResponse | null>(null);

  const columns: Column<AccountRuleResponse>[] = [
    { key: 'nome', label: 'Nome' },
    {
      key: 'condicao',
      label: 'Condição',
      render: (r) => (
        <Typography variant="body2" color="text.secondary">
          {[
            r.descricaoContains ? `descrição contém "${r.descricaoContains}"` : null,
            r.valorOperador && r.valorRef != null ? `valor ${r.valorOperador} ${r.valorRef}` : null,
          ]
            .filter(Boolean)
            .join(' e ') || '—'}
        </Typography>
      ),
    },
    { key: 'prioridade', label: 'Prioridade', align: 'right' },
    {
      key: 'ativo',
      label: 'Status',
      render: (r) => (
        <Chip
          size="small"
          label={r.ativo ? 'Ativa' : 'Inativa'}
          color={r.ativo ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <Tooltip title="Remover">
          <IconButton size="small" onClick={() => setToDelete(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nova regra
        </Button>
      </Box>
      <Card variant="outlined" sx={{ p: 0 }}>
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(r) => r.id}
          loading={query.isLoading}
          error={query.isError}
          onRetry={query.refetch}
          emptyMessage="Nenhuma regra configurada. Crie regras para classificar movimentações automaticamente."
        />
      </Card>
      <AccountRuleFormDialog open={open} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover regra"
        message={`Remover a regra "${toDelete?.nome}"?`}
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
