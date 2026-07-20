import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useAllAccountsQuery } from '@/modules/accounts/hooks';
import { AccountSelect } from '@/modules/accounts/components/AccountSelect';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import {
  useConfirmBatchMutation,
  useConfirmReconciliationMutation,
  usePendingReconciliationsQuery,
  useReconciliationHistoryQuery,
  useReconciliationSummaryQuery,
  useRejectBatchMutation,
  useRejectReconciliationMutation,
} from '../hooks';
import { ReconciliationSplitView } from '../components/ReconciliationSplitView';
import { ManualMatchModal } from '../components/ManualMatchModal';
import { GroupMatchModal } from '../components/GroupMatchModal';
import { MatchStatusBadge } from '../components/MatchStatusBadge';
import { ConciliacaoCards } from '../components/ConciliacaoCards';
import type { ReconciliationResponse } from '../types';

export function ReconciliationPage() {
  const [tab, setTab] = useState(0);
  const clienteId = useActiveClient();
  const accountsQuery = useAllAccountsQuery();
  // EB: cliente tem plano se houver conta especifica dele ou compartilhada (clienteId nulo).
  const semPlano =
    !!clienteId &&
    accountsQuery.isSuccess &&
    !(accountsQuery.data?.content ?? []).some(
      (a) => a.clienteId === clienteId || a.clienteId === null,
    );
  return (
    <>
      <PageHeader title="Conciliação" subtitle="Extrato x sistema" />
      {!clienteId ? (
        <EmptyState
          title="Selecione um cliente"
          description="Escolha um cliente no topo para ver as conciliações. Cada conciliação pertence a um cliente e a uma competência."
        />
      ) : (
        <>
          {semPlano && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Não foi identificado um plano de contas ativo para este cliente. Configure ou
              vincule um plano de contas antes de iniciar a conciliação.
            </Alert>
          )}
          <ConciliacaoCards />
          <SummaryBar />
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Pendentes" />
              <Tab label="Histórico" />
            </Tabs>
          </Box>
          {tab === 0 ? <PendingTab /> : <HistoryTab />}
        </>
      )}
    </>
  );
}

// Resumo do lote: conciliado x pendente x rejeitado, com quantidade e soma dos valores.
function SummaryBar() {
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const { data } = useReconciliationSummaryQuery({ clienteId, competencia });
  if (!data || data.total === 0) return null;

  const linha = (status: 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO') =>
    data.porStatus.find((p) => p.status === status);
  const chip = (
    label: string,
    color: 'default' | 'warning' | 'success' | 'error',
    status: 'PENDENTE' | 'CONFIRMADO' | 'REJEITADO',
  ) => {
    const l = linha(status);
    if (!l) return null;
    return (
      <Chip
        variant="outlined"
        color={color}
        label={`${label}: ${l.quantidade} · ${formatCurrency(l.valorTotal)}`}
      />
    );
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Resumo ({data.total} itens · {formatCurrency(data.valorTotal)}):
          </Typography>
          {chip('Pendentes', 'warning', 'PENDENTE')}
          {chip('Confirmados', 'success', 'CONFIRMADO')}
          {chip('Rejeitados', 'error', 'REJEITADO')}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PendingTab() {
  const { page, size, setPage } = usePagination(10);
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const query = usePendingReconciliationsQuery({ page, size, clienteId, competencia });
  const confirm = useConfirmReconciliationMutation();
  const reject = useRejectReconciliationMutation();
  const confirmBatch = useConfirmBatchMutation();
  const rejectBatch = useRejectBatchMutation();
  const [manual, setManual] = useState<ReconciliationResponse | null>(null);
  const [grupo, setGrupo] = useState<ReconciliationResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contaByItem, setContaByItem] = useState<Record<string, string | null>>({});

  const items = query.data?.content ?? [];
  const matched = items.filter((i) => i.matchedMovementId);

  // Conta a usar no item: a escolhida manualmente tem prioridade; senão a sugerida.
  const contaFor = (item: ReconciliationResponse): string | null =>
    contaByItem[item.id] ?? item.sugestao?.contaId ?? null;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = matched.length > 0 && matched.every((i) => selected.has(i.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(matched.map((i) => i.id)));

  const busy = confirm.isPending || reject.isPending || confirmBatch.isPending || rejectBatch.isPending;

  const confirmSelected = async () => {
    const itens = [...selected].map((id) => {
      const item = items.find((i) => i.id === id);
      return { id, contaSugerida: contaFor(item!) ?? undefined };
    });
    await confirmBatch.mutateAsync(itens);
    setSelected(new Set());
  };

  const rejectSelected = async () => {
    await rejectBatch.mutateAsync([...selected]);
    setSelected(new Set());
  };

  if (query.isLoading) return <LoadingState rows={4} />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;
  if (items.length === 0)
    return (
      <EmptyState
        title="Nenhuma pendência"
        description="Todas as movimentações estão conciliadas. Envie novos extratos em Uploads."
      />
    );

  return (
    <>
      {matched.length > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={allSelected} indeterminate={selected.size > 0 && !allSelected} onChange={toggleAll} />}
            label="Selecionar sugeridas"
          />
          {selected.size > 0 && (
            <Stack direction="row" spacing={1}>
              <Button color="error" startIcon={<CloseIcon />} disabled={busy} onClick={rejectSelected}>
                Rejeitar {selected.size}
              </Button>
              <Button variant="contained" startIcon={<CheckIcon />} disabled={busy} onClick={confirmSelected}>
                Confirmar {selected.size}
              </Button>
            </Stack>
          )}
        </Stack>
      )}
      <Stack spacing={2}>
        {items.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {item.matchedMovementId && (
                    <Checkbox size="small" checked={selected.has(item.id)} onChange={() => toggle(item.id)} sx={{ p: 0.5 }} />
                  )}
                  <MatchStatusBadge item={item} />
                </Stack>
              </Stack>
              <ReconciliationSplitView item={item} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <AccountSelect
                    label="Conta contábil (analítica)"
                    value={contaFor(item)}
                    onChange={(v) => setContaByItem((p) => ({ ...p, [item.id]: v }))}
                  />
                </Box>
                {item.sugestao && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color="info"
                    label={`Sugestão: ${item.sugestao.codigo ?? '—'}${
                      item.sugestao.origem ? ` · ${item.sugestao.origem}` : ''
                    }${item.sugestao.confianca != null ? ` · ${Math.round(item.sugestao.confianca)}%` : ''}`}
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                {item.matchedMovementId ? (
                  <>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<CloseIcon />}
                      disabled={busy}
                      onClick={() => reject.mutate(item.id)}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      disabled={busy}
                      onClick={() =>
                        confirm.mutate({ id: item.id, body: { contaSugerida: contaFor(item) ?? undefined } })
                      }
                    >
                      Confirmar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="small" variant="text" onClick={() => setGrupo(item)}>
                      Agrupar (N:1)
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setManual(item)}>
                      Conciliar manualmente
                    </Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {query.data && query.data.totalPages > 1 && (
        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <Button disabled={query.data.last} onClick={() => setPage(page + 1)}>
            Próxima
          </Button>
        </Stack>
      )}

      <ManualMatchModal item={manual} onClose={() => setManual(null)} />
      <GroupMatchModal item={grupo} onClose={() => setGrupo(null)} />
    </>
  );
}

function HistoryTab() {
  const { page, size, setPage, setSize } = usePagination();
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const query = useReconciliationHistoryQuery({ page, size, clienteId, competencia });

  const columns: Column<ReconciliationResponse>[] = [
    { key: 'data', label: 'Data', render: (r) => formatDate(r.movimento?.data ?? null) },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (r) => r.movimento?.descricao ?? r.movementId.slice(0, 8),
    },
    {
      key: 'valor',
      label: 'Valor',
      align: 'right',
      render: (r) => formatCurrency(r.movimento?.valor ?? null),
    },
    {
      key: 'conta',
      label: 'Conta',
      render: (r) => (r.sugestao?.codigo ? `${r.sugestao.codigo} — ${r.sugestao.nome ?? ''}` : '—'),
    },
    { key: 'camada', label: 'Camada', render: (r) => r.camada ?? '—' },
    { key: 'status', label: 'Status', render: (r) => <MatchStatusBadge item={r} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={query.data?.content ?? []}
      rowKey={(r) => r.id}
      loading={query.isLoading}
      error={query.isError}
      onRetry={query.refetch}
      emptyMessage="Nenhuma conciliação no histórico ainda."
      page={page}
      size={size}
      totalElements={query.data?.totalElements ?? 0}
      onPageChange={setPage}
      onSizeChange={setSize}
    />
  );
}
