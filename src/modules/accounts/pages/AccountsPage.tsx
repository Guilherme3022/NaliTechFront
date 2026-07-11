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
  useBankAccountsQuery,
  useChartOfAccountsQuery,
  useBranchesQuery,
  useCostCentersQuery,
  useDeleteAccountRuleMutation,
  useDeleteBankAccountMutation,
  useDeleteBranchMutation,
  useDeleteChartAccountMutation,
  useDeleteCostCenterMutation,
  useParametrizationRequestsQuery,
} from '../hooks';
import { ChartAccountFormDialog } from '../components/ChartAccountFormDialog';
import { AccountRuleFormDialog } from '../components/AccountRuleFormDialog';
import { BankAccountFormDialog } from '../components/BankAccountFormDialog';
import { CostCenterFormDialog } from '../components/CostCenterFormDialog';
import { BranchFormDialog } from '../components/BranchFormDialog';
import { ApplyParametrizationDialog } from '../components/ApplyParametrizationDialog';
import type {
  AccountRuleResponse,
  BankAccountResponse,
  BranchResponse,
  ChartAccountResponse,
  CostCenterResponse,
  ParametrizationRequest,
} from '../types';

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function AccountsPage() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <PageHeader title="Plano de contas" subtitle="Estrutura contábil e regras de classificação" />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Contas" />
          <Tab label="Motor de regras" />
          <Tab label="Parametrização" />
          <Tab label="Contas bancárias" />
          <Tab label="Centros de custo" />
          <Tab label="Filiais" />
        </Tabs>
      </Box>
      {tab === 0 && <ChartTab />}
      {tab === 1 && <RulesTab />}
      {tab === 2 && <ParametrizationTab />}
      {tab === 3 && <BankAccountsTab />}
      {tab === 4 && <CostCentersTab />}
      {tab === 5 && <BranchesTab />}
    </>
  );
}

function BranchesTab() {
  const query = useBranchesQuery();
  const del = useDeleteBranchMutation();
  const [editing, setEditing] = useState<BranchResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BranchResponse | null>(null);

  const columns: Column<BranchResponse>[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj', label: 'CNPJ', render: (b) => b.cnpj ?? '—' },
    {
      key: 'ativo',
      label: 'Status',
      render: (b) => (
        <Chip
          size="small"
          label={b.ativo ? 'Ativa' : 'Inativa'}
          color={b.ativo ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (
        <>
          <IconButton size="small" onClick={() => { setEditing(b); setOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setToDelete(b)}>
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
          Nova filial
        </Button>
      </Box>
      <Card variant="outlined" sx={{ p: 0 }}>
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(b) => b.id}
          loading={query.isLoading}
          error={query.isError}
          onRetry={query.refetch}
          emptyMessage="Nenhuma filial. Cadastre filiais para separar lançamentos por matriz/filial."
        />
      </Card>
      <BranchFormDialog open={open} branch={editing} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover filial"
        message={`Remover "${toDelete?.nome}"?`}
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

function CostCentersTab() {
  const query = useCostCentersQuery();
  const del = useDeleteCostCenterMutation();
  const [editing, setEditing] = useState<CostCenterResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CostCenterResponse | null>(null);

  const columns: Column<CostCenterResponse>[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nome', label: 'Nome' },
    {
      key: 'ativo',
      label: 'Status',
      render: (c) => (
        <Chip
          size="small"
          label={c.ativo ? 'Ativo' : 'Inativo'}
          color={c.ativo ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (c) => (
        <>
          <IconButton size="small" onClick={() => { setEditing(c); setOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setToDelete(c)}>
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
          Novo centro de custo
        </Button>
      </Box>
      <Card variant="outlined" sx={{ p: 0 }}>
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(c) => c.id}
          loading={query.isLoading}
          error={query.isError}
          onRetry={query.refetch}
          emptyMessage="Nenhum centro de custo. Cadastre e vincule em regras De/Para para apropriação automática."
        />
      </Card>
      <CostCenterFormDialog open={open} costCenter={editing} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover centro de custo"
        message={`Remover "${toDelete?.nome}"?`}
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

function ParametrizationTab() {
  const query = useParametrizationRequestsQuery();
  const [selected, setSelected] = useState<ParametrizationRequest | null>(null);

  const columns: Column<ParametrizationRequest>[] = [
    { key: 'descricaoPadrao', label: 'Descrição (padrão)' },
    { key: 'ocorrencias', label: 'Ocorrências', align: 'right' },
    { key: 'valorTotal', label: 'Valor total', align: 'right', render: (r) => brl(r.valorTotal) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <Button size="small" variant="outlined" onClick={() => setSelected(r)}>
          Parametrizar
        </Button>
      ),
    },
  ];

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Padrões conciliados que ainda não têm conta contábil vinculada. Parametrize uma vez e o
        sistema classifica os próximos arquivos automaticamente.
      </Typography>
      <Card variant="outlined" sx={{ p: 0 }}>
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(r) => r.descricaoPadrao}
          loading={query.isLoading}
          error={query.isError}
          onRetry={query.refetch}
          emptyMessage="Nada pendente de parametrização. Tudo classificado! 🎉"
        />
      </Card>
      <ApplyParametrizationDialog
        open={!!selected}
        request={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function BankAccountsTab() {
  const query = useBankAccountsQuery();
  const del = useDeleteBankAccountMutation();
  const [editing, setEditing] = useState<BankAccountResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BankAccountResponse | null>(null);

  const columns: Column<BankAccountResponse>[] = [
    { key: 'nome', label: 'Nome' },
    {
      key: 'padrao',
      label: 'Padrão',
      render: (b) =>
        b.padrao ? <Chip size="small" label="Padrão" color="primary" variant="outlined" /> : '—',
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (
        <>
          <IconButton size="small" onClick={() => { setEditing(b); setOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setToDelete(b)}>
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
          Nova conta bancária
        </Button>
      </Box>
      <Card variant="outlined" sx={{ p: 0 }}>
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(b) => b.id}
          loading={query.isLoading}
          error={query.isError}
          onRetry={query.refetch}
          emptyMessage="Nenhuma conta bancária. Cadastre a conta contábil do banco para gerar a partida dobrada."
        />
      </Card>
      <BankAccountFormDialog open={open} account={editing} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover conta bancária"
        message={`Remover "${toDelete?.nome}"?`}
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
