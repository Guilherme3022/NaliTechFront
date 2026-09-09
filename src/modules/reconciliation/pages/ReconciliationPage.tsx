import { Alert } from '@mui/material';
import { useAllAccountsQuery } from '@/modules/accounts/hooks';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReplayIcon from '@mui/icons-material/Replay';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/states';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import {
  useConfirmReconciliationMutation,
  usePendingReconciliationsQuery,
  useReconciliationHistoryQuery,
  useRejectReconciliationMutation,
  useReprocessMutation,
  useStartAiSweepMutation,
} from '../hooks';
import { ReconciliationSplitView } from '../components/ReconciliationSplitView';
import { ManualMatchModal } from '../components/ManualMatchModal';
import { MatchStatusBadge } from '../components/MatchStatusBadge';
import { ConciliacaoCards } from '../components/ConciliacaoCards';
import { ReconciliationReview } from '../components/ReconciliationReview';

export function ReconciliationPage() {
  const clienteId = useActiveClient();
  const competencia = useActiveCompetence() ?? undefined;
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
          <ReconciliationReview clienteId={clienteId} competencia={competencia} />
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
  const reprocess = useReprocessMutation();
  const aiSweep = useStartAiSweepMutation();
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

  const semMatch = items.filter((i) => !i.matchedMovementId).length;

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="flex-end"
        sx={{ mb: 2 }}
      >
        <Button
          variant="outlined"
          startIcon={<ReplayIcon />}
          disabled={reprocess.isPending}
          onClick={() => reprocess.mutate({ clienteId, competencia })}
        >
          Reprocessar regras
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AutoAwesomeIcon />}
          disabled={aiSweep.isPending || semMatch === 0}
          onClick={() => aiSweep.mutate({ clienteId, competencia })}
        >
          Validar {semMatch > 0 ? `${semMatch} ` : ''}pendências com IA
        </Button>
        {suggested.length > 0 && (
          <Button variant="contained" startIcon={<CheckIcon />} disabled={confirm.isPending} onClick={confirmAll}>
            Confirmar {suggested.length} sugeridas
          </Button>
        )}
      </Stack>
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
