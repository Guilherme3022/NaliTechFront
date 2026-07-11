import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  AccountRuleRequest,
  AccountRuleResponse,
  ApplyParametrizationRequest,
  ApplyParametrizationResponse,
  BankAccountRequest,
  BankAccountResponse,
  BranchRequest,
  BranchResponse,
  ChartAccountRequest,
  ChartAccountResponse,
  CostCenterRequest,
  CostCenterResponse,
  LoanContractRequest,
  LoanContractResponse,
  ManualEntryRequest,
  ParametrizationRequest,
  SuggestionResponse,
} from './types';

export const accountsApi = {
  chart: (params: PageParams) =>
    api.get<Page<ChartAccountResponse>>('/chart-of-accounts', { params }).then((r) => r.data),
  createChart: (body: ChartAccountRequest) =>
    api.post<ChartAccountResponse>('/chart-of-accounts', body).then((r) => r.data),
  updateChart: (id: string, body: ChartAccountRequest) =>
    api.put<ChartAccountResponse>(`/chart-of-accounts/${id}`, body).then((r) => r.data),
  deleteChart: (id: string) => api.delete(`/chart-of-accounts/${id}`),

  rules: () => api.get<AccountRuleResponse[]>('/account-rules').then((r) => r.data),
  createRule: (body: AccountRuleRequest) =>
    api.post<AccountRuleResponse>('/account-rules', body).then((r) => r.data),
  updateRule: (id: string, body: AccountRuleRequest) =>
    api.put<AccountRuleResponse>(`/account-rules/${id}`, body).then((r) => r.data),
  deleteRule: (id: string) => api.delete(`/account-rules/${id}`),

  suggestions: (movementId: string) =>
    api.get<SuggestionResponse>(`/movements/${movementId}/suggestions`).then((r) => r.data),
  classify: (movementId: string, contaId: string) =>
    api.post(`/movements/${movementId}/classify`, { contaId }),
  setEntry: (movementId: string, body: ManualEntryRequest) =>
    api.post(`/movements/${movementId}/entry`, body),

  // Increment 1 — Parametrização De/Para.
  parametrizationRequests: () =>
    api.get<ParametrizationRequest[]>('/parametrization/requests').then((r) => r.data),
  applyParametrization: (body: ApplyParametrizationRequest) =>
    api.post<ApplyParametrizationResponse>('/parametrization/apply', body).then((r) => r.data),

  // Increment 2 — Contas bancárias.
  bankAccounts: () => api.get<BankAccountResponse[]>('/bank-accounts').then((r) => r.data),
  createBankAccount: (body: BankAccountRequest) =>
    api.post<BankAccountResponse>('/bank-accounts', body).then((r) => r.data),
  updateBankAccount: (id: string, body: BankAccountRequest) =>
    api.put<BankAccountResponse>(`/bank-accounts/${id}`, body).then((r) => r.data),
  deleteBankAccount: (id: string) => api.delete(`/bank-accounts/${id}`),

  // Increment 4 — Centros de custo.
  costCenters: () => api.get<CostCenterResponse[]>('/cost-centers').then((r) => r.data),
  createCostCenter: (body: CostCenterRequest) =>
    api.post<CostCenterResponse>('/cost-centers', body).then((r) => r.data),
  updateCostCenter: (id: string, body: CostCenterRequest) =>
    api.put<CostCenterResponse>(`/cost-centers/${id}`, body).then((r) => r.data),
  deleteCostCenter: (id: string) => api.delete(`/cost-centers/${id}`),
  setCostCenter: (movementId: string, centroCustoId: string | null) =>
    api.post(`/movements/${movementId}/cost-center`, { centroCustoId }),

  // Increment 5 — Filiais.
  branches: () => api.get<BranchResponse[]>('/branches').then((r) => r.data),
  createBranch: (body: BranchRequest) =>
    api.post<BranchResponse>('/branches', body).then((r) => r.data),
  updateBranch: (id: string, body: BranchRequest) =>
    api.put<BranchResponse>(`/branches/${id}`, body).then((r) => r.data),
  deleteBranch: (id: string) => api.delete(`/branches/${id}`),
  setBranch: (movementId: string, filialId: string | null) =>
    api.post(`/movements/${movementId}/branch`, { filialId }),

  // Increment 7 — Contratos de financiamento.
  loanContracts: () => api.get<LoanContractResponse[]>('/loan-contracts').then((r) => r.data),
  createLoanContract: (body: LoanContractRequest) =>
    api.post<LoanContractResponse>('/loan-contracts', body).then((r) => r.data),
  updateLoanContract: (id: string, body: LoanContractRequest) =>
    api.put<LoanContractResponse>(`/loan-contracts/${id}`, body).then((r) => r.data),
  deleteLoanContract: (id: string) => api.delete(`/loan-contracts/${id}`),
  setLoanContract: (movementId: string, loanContractId: string | null) =>
    api.post(`/movements/${movementId}/loan-contract`, { loanContractId }),
};
