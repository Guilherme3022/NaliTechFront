import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { useAllAccountsQuery } from '@/modules/accounts/hooks';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import {
  useConfirmReconciliationMutation,
  usePendingReconciliationsQuery,
  useReconciliationHistoryQuery,
  useRejectReconciliationMutation,
} from '../hooks';
import { ReconciliationSplitView } from '../components/ReconciliationSplitView';
import { ManualMatchModal } from '../components/ManualMatchModal';
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

function PendingTab() {
  const { page, size, setPage } = usePagination(10);
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const query = usePendingReconciliationsQuery({ page, size, clienteId, competencia });
  const confirm = useConfirmReconciliationMutation();
  const reject = useRejectReconciliationMutation();
  const [manual, setManual] = useState<ReconciliationResponse | null>(null);

  const items = query.data?.content ?? [];
  const suggested = items.filter((i) => i.matchedMovementId);

  const confirmAll = async () => {
    // Confirma em lote todas as pendências que já têm sugestão (E8.2).
    for (const item of suggested) {
      await confirm.mutateAsync({ id: item.id, body: {} });
    }
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
      {suggested.length > 0 && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button variant="contained" startIcon={<CheckIcon />} disabled={confirm.isPending} onClick={confirmAll}>
            Confirmar {suggested.length} sugeridas
          </Button>
        </Box>
      )}
      <Stack spacing={2}>
        {items.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <MatchStatusBadge item={item} />
              </Stack>
              <ReconciliationSplitView item={item} />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                {item.matchedMovementId ? (
                  <>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<CloseIcon />}
                      disabled={reject.isPending}
                      onClick={() => reject.mutate(item.id)}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      disabled={confirm.isPending}
                      onClick={() => confirm.mutate({ id: item.id, body: {} })}
                    >
                      Confirmar
                    </Button>
                  </>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => setManual(item)}>
                    Conciliar manualmente
                  </Button>
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
    </>
  );
}

function HistoryTab() {
  const { page, size, setPage, setSize } = usePagination();
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const query = useReconciliationHistoryQuery({ page, size, clienteId, competencia });

  const columns: Column<ReconciliationResponse>[] = [
    { key: 'movementId', label: 'Movimentação', render: (r) => r.movementId.slice(0, 8) },
    { key: 'matchedMovementId', label: 'Correspondência', render: (r) => r.matchedMovementId?.slice(0, 8) ?? '—' },
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
