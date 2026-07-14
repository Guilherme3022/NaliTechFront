import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { accountsApi } from './api';
import type {
  AccountRuleRequest,
  ApplyParametrizationRequest,
  BankAccountRequest,
  BranchRequest,
  ChartAccountRequest,
  CostCenterRequest,
  LoanContractRequest,
} from './types';

const CHART = 'chart-of-accounts';
const RULES = 'account-rules';
const PARAMETRIZATION = 'parametrization-requests';
const BANK_ACCOUNTS = 'bank-accounts';
const COST_CENTERS = 'cost-centers';
const BRANCHES = 'branches';
const LOANS = 'loan-contracts';

// E9.5 — hooks de plano de contas e regras.
export function useChartOfAccountsQuery(params: PageParams) {
  return useQuery({ queryKey: [CHART, params], queryFn: () => accountsApi.chart(params) });
}

export function useImportChartMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, clienteId }: { file: File; clienteId: string }) =>
      accountsApi.importChart(file, clienteId),
    onSuccess: (res) => {
      notifySuccess(`Importado: ${res.contasCriadas} conta(s) criada(s), ${res.contasIgnoradas} ignorada(s).`);
      qc.invalidateQueries({ queryKey: [CHART] });
    },
  });
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

// Increment 1 — Parametrização De/Para.
export function useParametrizationRequestsQuery() {
  return useQuery({
    queryKey: [PARAMETRIZATION],
    queryFn: accountsApi.parametrizationRequests,
  });
}

export function useApplyParametrizationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ApplyParametrizationRequest) => accountsApi.applyParametrization(body),
    onSuccess: (result) => {
      notifySuccess(
        `${result.classificados} movimentação(ões) classificada(s)${result.regraCriada ? ' e regra criada' : ''}.`,
      );
      qc.invalidateQueries({ queryKey: [PARAMETRIZATION] });
      qc.invalidateQueries({ queryKey: [RULES] });
    },
  });
}

// Increment 2 — Contas bancárias.
export function useBankAccountsQuery() {
  return useQuery({ queryKey: [BANK_ACCOUNTS], queryFn: accountsApi.bankAccounts });
}

export function useCreateBankAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BankAccountRequest) => accountsApi.createBankAccount(body),
    onSuccess: () => {
      notifySuccess('Conta bancária criada.');
      qc.invalidateQueries({ queryKey: [BANK_ACCOUNTS] });
    },
  });
}

export function useUpdateBankAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BankAccountRequest }) =>
      accountsApi.updateBankAccount(id, body),
    onSuccess: () => {
      notifySuccess('Conta bancária atualizada.');
      qc.invalidateQueries({ queryKey: [BANK_ACCOUNTS] });
    },
  });
}

export function useDeleteBankAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteBankAccount(id),
    onSuccess: () => {
      notifySuccess('Conta bancária removida.');
      qc.invalidateQueries({ queryKey: [BANK_ACCOUNTS] });
    },
  });
}

// Increment 4 — Centros de custo.
export function useCostCentersQuery() {
  return useQuery({ queryKey: [COST_CENTERS], queryFn: accountsApi.costCenters });
}

export function useCreateCostCenterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CostCenterRequest) => accountsApi.createCostCenter(body),
    onSuccess: () => {
      notifySuccess('Centro de custo criado.');
      qc.invalidateQueries({ queryKey: [COST_CENTERS] });
    },
  });
}

export function useUpdateCostCenterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CostCenterRequest }) =>
      accountsApi.updateCostCenter(id, body),
    onSuccess: () => {
      notifySuccess('Centro de custo atualizado.');
      qc.invalidateQueries({ queryKey: [COST_CENTERS] });
    },
  });
}

export function useDeleteCostCenterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteCostCenter(id),
    onSuccess: () => {
      notifySuccess('Centro de custo removido.');
      qc.invalidateQueries({ queryKey: [COST_CENTERS] });
    },
  });
}

// Increment 5 — Filiais.
export function useBranchesQuery() {
  return useQuery({ queryKey: [BRANCHES], queryFn: accountsApi.branches });
}

export function useCreateBranchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BranchRequest) => accountsApi.createBranch(body),
    onSuccess: () => {
      notifySuccess('Filial criada.');
      qc.invalidateQueries({ queryKey: [BRANCHES] });
    },
  });
}

export function useUpdateBranchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BranchRequest }) =>
      accountsApi.updateBranch(id, body),
    onSuccess: () => {
      notifySuccess('Filial atualizada.');
      qc.invalidateQueries({ queryKey: [BRANCHES] });
    },
  });
}

export function useDeleteBranchMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteBranch(id),
    onSuccess: () => {
      notifySuccess('Filial removida.');
      qc.invalidateQueries({ queryKey: [BRANCHES] });
    },
  });
}

// Increment 7 — Contratos de financiamento.
export function useLoanContractsQuery() {
  return useQuery({ queryKey: [LOANS], queryFn: accountsApi.loanContracts });
}

export function useCreateLoanContractMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoanContractRequest) => accountsApi.createLoanContract(body),
    onSuccess: () => {
      notifySuccess('Contrato criado.');
      qc.invalidateQueries({ queryKey: [LOANS] });
    },
  });
}

export function useUpdateLoanContractMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: LoanContractRequest }) =>
      accountsApi.updateLoanContract(id, body),
    onSuccess: () => {
      notifySuccess('Contrato atualizado.');
      qc.invalidateQueries({ queryKey: [LOANS] });
    },
  });
}

export function useDeleteLoanContractMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteLoanContract(id),
    onSuccess: () => {
      notifySuccess('Contrato removido.');
      qc.invalidateQueries({ queryKey: [LOANS] });
    },
  });
}
