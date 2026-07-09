import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type { AuditFilters, AuditLog } from './types';

export const auditApi = {
  list: (params: PageParams & AuditFilters) =>
    api.get<Page<AuditLog>>('/audit-logs', { params }).then((r) => r.data),
};
