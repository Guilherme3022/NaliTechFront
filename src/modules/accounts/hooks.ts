import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { accountsApi } from './api';
import type { AccountRuleRequest, ChartAccountRequest } from './types';

const CHART = 'chart-of-accounts';
const RULES = 'account-rules';

// E9.5 — hooks de plano de contas e regras.
export function useChartOfAccountsQuery(params: PageParams) {
  return useQuery({ queryKey: [CHART, params], queryFn: () => accountsApi.chart(params) });
}

// Lista todas as contas (para selects), buscando um page grande.
export function useAllAccountsQuery() {
  return useQuery({
    queryKey: [CHART, 'all'],
    queryFn: () => accountsApi.chart({ page: 0, size: 500 }),
  });
}

export function useCreateChartAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ChartAccountRequest) => accountsApi.createChart(body),
    onSuccess: () => {
      notifySuccess('Conta criada.');
      qc.invalidateQueries({ queryKey: [CHART] });
    },
  });
}

export function useUpdateChartAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ChartAccountRequest }) =>
      accountsApi.updateChart(id, body),
    onSuccess: () => {
      notifySuccess('Conta atualizada.');
      qc.invalidateQueries({ queryKey: [CHART] });
    },
  });
}

export function useDeleteChartAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteChart(id),
    onSuccess: () => {
      notifySuccess('Conta removida.');
      qc.invalidateQueries({ queryKey: [CHART] });
    },
  });
}

export function useAccountRulesQuery() {
  return useQuery({ queryKey: [RULES], queryFn: accountsApi.rules });
}

export function useCreateAccountRuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AccountRuleRequest) => accountsApi.createRule(body),
    onSuccess: () => {
      notifySuccess('Regra criada.');
      qc.invalidateQueries({ queryKey: [RULES] });
    },
  });
}

export function useDeleteAccountRuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteRule(id),
    onSuccess: () => {
      notifySuccess('Regra removida.');
      qc.invalidateQueries({ queryKey: [RULES] });
    },
  });
}

export function useClassifyMovementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, contaId }: { movementId: string; contaId: string }) =>
      accountsApi.classify(movementId, contaId),
    onSuccess: () => {
      notifySuccess('Movimentação classificada.');
      qc.invalidateQueries({ queryKey: ['reconciliations'] });
    },
  });
}
