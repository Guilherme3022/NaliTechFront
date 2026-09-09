import { Alert } from '@mui/material';
import { useAllAccountsQuery } from '@/modules/accounts/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/states';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
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
