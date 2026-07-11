import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';

// E11.4 — hooks do dashboard.
export function useDashboardSummaryQuery() {
  return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardApi.summary });
}

export function useDashboardActivityQuery() {
  return useQuery({ queryKey: ['dashboard', 'activity'], queryFn: dashboardApi.activity });
}

// Increment 8 — visão operacional + carteira.
export function useDashboardOperationQuery() {
  return useQuery({ queryKey: ['dashboard', 'operation'], queryFn: dashboardApi.operation });
}

export function useDashboardPortfolioQuery() {
  return useQuery({ queryKey: ['dashboard', 'portfolio'], queryFn: dashboardApi.portfolio });
}
