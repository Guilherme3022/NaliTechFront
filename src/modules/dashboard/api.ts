import { api } from '@/shared/lib/api';
import type {
  DashboardActivity,
  DashboardPortfolio,
  DashboardSummary,
  OperationSummary,
} from './types';

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
  activity: () => api.get<DashboardActivity>('/dashboard/activity').then((r) => r.data),
  operation: () => api.get<OperationSummary>('/dashboard/operation').then((r) => r.data),
  portfolio: () => api.get<DashboardPortfolio>('/dashboard/portfolio').then((r) => r.data),
};
