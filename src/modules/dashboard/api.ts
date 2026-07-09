import { api } from '@/shared/lib/api';
import type { DashboardActivity, DashboardSummary } from './types';

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
  activity: () => api.get<DashboardActivity>('/dashboard/activity').then((r) => r.data),
};
