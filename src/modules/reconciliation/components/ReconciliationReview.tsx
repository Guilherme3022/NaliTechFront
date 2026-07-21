import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
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
import { notifySuccess } from '@/shared/lib/notify';
import {
  isConciliacaoProcessing,
  useConciliacoesQuery,
  useConfirmBatchMutation,
  useConfirmReconciliationMutation,
  useOptimizeReconciliationMutation,
  usePendingReconciliationsQuery,
  useReconciliationHistoryQuery,
  useReconciliationSummaryQuery,
  useRejectBatchMutation,
  useRejectReconciliationMutation,
} from '../hooks';
import { useMovementsQuery } from '@/modules/movements/hooks';
import type { MovementResponse, MovementStatus } from '@/modules/movements/types';
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
  // Reaproveita o cache da lista de conciliacoes (mesma query dos cards) so para saber
  // se o pipeline ainda esta processando — e, com isso, ligar/desligar o polling.
  const conciliacoes = useConciliacoesQuery({ clienteId, competencia }).data;
  const polling = isConciliacaoProcessing(conciliacoes);

  // UX do processamento assincrono:
  //  - longRunning: apos ~20s trocamos a mensagem para avisar que pode demorar mais.
  //  - wasProcessing: detecta a transicao processando -> concluido para dar um toast.
  const [longRunning, setLongRunning] = useState(false);
  const wasProcessing = useRef(false);
  const qc = useQueryClient();
  useEffect(() => {
    if (polling) {
      wasProcessing.current = true;
      setLongRunning(false);
      const t = setTimeout(() => setLongRunning(true), 20000);
      return () => clearTimeout(t);
    }
    if (wasProcessing.current) {
      wasProcessing.current = false;
      setLongRunning(false);
      notifySuccess('Arquivo processado. Lançamentos prontos para revisão.');
      // Garante uma ultima atualizacao das listas (pending/summary) independentemente
      // do timing do ultimo poll, para os lancamentos recem-gerados aparecerem.
      qc.invalidateQueries({ queryKey: ['reconciliations'] });
    }
  }, [polling, qc]);

  return (
    <>
      {polling && (
        <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ mb: 2 }}>
          {longRunning
            ? 'Ainda processando o arquivo… documentos maiores podem levar mais alguns minutos. Você pode continuar usando o sistema — os lançamentos aparecerão aqui sozinhos.'
            : 'Seu arquivo está sendo processado. Isso pode levar alguns minutos — os lançamentos aparecerão aqui automaticamente, sem precisar recarregar a página.'}
        </Alert>
      )}
      <SummaryBar clienteId={clienteId} competencia={competencia} polling={polling} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="A conciliar" />
          <Tab label="Extrato (banco)" />
          <Tab label="Sistema (contas a pagar/receber)" />
          <Tab label="Concluídas" />
        </Tabs>
      </Box>
      {tab === 0 && <PendingTab clienteId={clienteId} competencia={competencia} polling={polling} />}
      {tab === 1 && (
        <MovementsSideTab clienteId={clienteId} competencia={competencia} origem="EXTRATO" />
      )}
      {tab === 2 && (
        <MovementsSideTab clienteId={clienteId} competencia={competencia} origem="SISTEMA" />
      )}
      {tab === 3 && <HistoryTab clienteId={clienteId} competencia={competencia} />}
    </>
  );
}

// Situacao da movimentacao (por lado) em linguagem do contador.
function MovStatusChip({ status }: { status: MovementStatus }) {
  const mapa: Record<MovementStatus, { label: string; color: 'default' | 'warning' | 'success' | 'info' }> = {
    NORMALIZADO: { label: 'A conciliar', color: 'warning' },
    CONCILIACAO_PENDENTE: { label: 'Em conciliação', color: 'info' },
    CONCILIADO: { label: 'Conciliado', color: 'success' },
    CLASSIFICADO: { label: 'Classificado', color: 'success' },
  };
  const s = mapa[status];
  return <Chip size="small" variant="outlined" color={s.color} label={s.label} />;
}

// Aba que lista as movimentacoes de um lado (extrato OU sistema) e sua situacao.
function MovementsSideTab({
  clienteId,
  competencia,
  origem,
}: Props & { origem: 'EXTRATO' | 'SISTEMA' }) {
  const { page, size, setPage, setSize } = usePagination();
  const query = useMovementsQuery({ page, size, clienteId, competencia, origem });

  const columns: Column<MovementResponse>[] = [
    { key: 'data', label: 'Data', render: (m) => formatDate(m.data) },
    { key: 'descricao', label: 'Descrição / contraparte', render: (m) => m.descricao ?? '—' },
    { key: 'documento', label: 'CNPJ/Doc', render: (m) => m.documento ?? '—' },
    { key: 'valor', label: 'Valor', align: 'right', render: (m) => formatCurrency(m.valor) },
    { key: 'status', label: 'Situação', render: (m) => <MovStatusChip status={m.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={query.data?.content ?? []}
      rowKey={(m) => m.id}
      loading={query.isLoading}
      error={query.isError}
      onRetry={query.refetch}
      emptyMessage={
        origem === 'EXTRATO'
          ? 'Nenhum lançamento de extrato importado nesta competência.'
          : 'Nenhum lançamento do sistema (contas a pagar/receber) importado nesta competência.'
      }
      page={page}
      size={size}
      totalElements={query.data?.totalElements ?? 0}
      onPageChange={setPage}
      onSizeChange={setSize}
    />
  );
}

function SummaryBar({ clienteId, competencia, polling }: Props & { polling?: boolean }) {
  const { data } = useReconciliationSummaryQuery({ clienteId, competencia }, { polling });
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

function PendingTab({ clienteId, competencia, polling }: Props & { polling?: boolean }) {
  const { page, size, setPage, setSize } = usePagination(10);
  const query = usePendingReconciliationsQuery({ page, size, clienteId, competencia }, { polling });
  const confirm = useConfirmReconciliationMutation();
  const reject = useRejectReconciliationMutation();
  const confirmBatch = useConfirmBatchMutation();
  const rejectBatch = useRejectBatchMutation();
  const optimize = useOptimizeReconciliationMutation();
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
          {competencia && (
            <Button
              size="small"
              variant="text"
              disabled={optimize.isPending}
              onClick={() => optimize.mutate({ clienteId, competencia })}
              title="Reprocessa os pendentes escolhendo os melhores pares (útil quando há vários valores iguais)"
            >
              Otimizar
            </Button>
          )}
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
                    <Button size="small" variant="outlined" onClick={() => setGrupo(item)}>
                      Vincular ao sistema
                    </Button>
                    <Button size="small" variant="text" onClick={() => setManual(item)}>
                      Classificar direto
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
