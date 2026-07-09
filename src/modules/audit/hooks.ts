import { useQuery } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { auditApi } from './api';
import type { AuditFilters } from './types';

// E15.3 — hook de logs de auditoria.
export function useAuditLogsQuery(params: PageParams & AuditFilters) {
  return useQuery({ queryKey: ['audit-logs', params], queryFn: () => auditApi.list(params) });
}
