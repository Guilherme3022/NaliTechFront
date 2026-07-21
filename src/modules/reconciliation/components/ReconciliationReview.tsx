import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { AccountSelect } from '@/modules/accounts/components/AccountSelect';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import {
  useConfirmBatchMutation,
  useConfirmReconciliationMutation,
  usePendingReconciliationsQuery,
  useReconciliationHistoryQuery,
  useReconciliationSummaryQuery,
  useRejectBatchMutation,
  useRejectReconciliationMutation,
} from '../hooks';
import { ReconciliationSplitView } from './ReconciliationSplitView';
import { ManualMatchModal } from './ManualMatchModal';
import { GroupMatchModal } from './GroupMatchModal';
import { MatchStatusBadge } from './MatchStatusBadge';
import type { ReconciliationResponse } from '../types';

interface Props {
  clienteId: string;
  // competencia no formato "YYYY-MM" (opcional; sem ela lista todas do cliente).
  competencia?: string;
}

/**
 * Revisão dos itens de conciliação (extrato × sistema) de um cliente/competência:
 * resumo, pendentes (confirmar/rejeitar/manual/agrupar) e histórico. Reutilizado
 * tanto na tela geral de Conciliação quanto dentro do detalhe de um lote.
 */
export function ReconciliationReview({ clienteId, competencia }: Props) {
  const [tab, setTab] = useState(0);
  return (
    <>
      <SummaryBar clienteId={clienteId} competencia={competencia} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Pendentes" />
          <Tab label="Histórico" />
        </Tabs>
      </Box>
      {tab === 0 ? (
        <PendingTab clienteId={clienteId} competencia={competencia} />
      ) : (
        <HistoryTab clienteId={clienteId} competencia={competencia} />
      )}
    </>
  );
}

function SummaryBar({ clienteId, competencia }: Props) {
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
        key={status}
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

function PendingTab({ clienteId, competencia }: Props) {
  const { page, size, setPage, setSize } = usePagination(10);
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

  const busy =
    confirm.isPending || reject.isPending || confirmBatch.isPending || rejectBatch.isPending;

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
        description="Todas as movimentações do extrato estão conciliadas, ou ainda não há extrato/sistema importado para este cliente nesta competência."
      />
    );

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
        flexWrap="wrap"
        useFlexGap
        spacing={1}
      >
        {matched.length > 0 ? (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selected.size > 0 && !allSelected}
                onChange={toggleAll}
              />
            }
            label="Selecionar sugeridas"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {query.data?.totalElements ?? 0} pendência(s)
          </Typography>
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          {selected.size > 0 && (
            <>
              <Button size="small" color="error" startIcon={<CloseIcon />} disabled={busy} onClick={rejectSelected}>
                Rejeitar {selected.size}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckIcon />}
                disabled={busy}
                onClick={confirmSelected}
              >
                Confirmar {selected.size}
              </Button>
            </>
          )}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="tam-pagina">Por página</InputLabel>
            <Select
              labelId="tam-pagina"
              label="Por página"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
      <Stack spacing={1.25}>
        {items.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {item.matchedMovementId && (
                    <Checkbox
                      size="small"
                      checked={selected.has(item.id)}
                      onChange={() => toggle(item.id)}
                      sx={{ p: 0.5 }}
                    />
                  )}
                  <MatchStatusBadge item={item} />
                </Stack>
              </Stack>
              <ReconciliationSplitView item={item} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
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

              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
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
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
          <Button size="small" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <Typography variant="body2" color="text.secondary">
            Página {page + 1} de {query.data.totalPages}
          </Typography>
          <Button size="small" disabled={query.data.last} onClick={() => setPage(page + 1)}>
            Próxima
          </Button>
        </Stack>
      )}

      <ManualMatchModal item={manual} onClose={() => setManual(null)} />
      <GroupMatchModal item={grupo} onClose={() => setGrupo(null)} />
    </>
  );
}

function HistoryTab({ clienteId, competencia }: Props) {
  const { page, size, setPage, setSize } = usePagination();
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
