import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  AccountRuleRequest,
  AccountRuleResponse,
  ChartAccountRequest,
  ChartAccountResponse,
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
};
