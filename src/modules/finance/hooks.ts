import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { financeApi } from './api';
import type { CreateFeeRequest, CreateInvoiceRequest, InvoiceStatus } from './types';

const KEY = 'finance';

// E12.5 — hooks financeiros.
export function useOfficeFeesQuery() {
  return useQuery({ queryKey: [KEY, 'fees'], queryFn: financeApi.fees });
}

export function useCreateFeeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFeeRequest) => financeApi.createFee(body),
    onSuccess: () => {
      notifySuccess('Honorário cadastrado.');
      qc.invalidateQueries({ queryKey: [KEY, 'fees'] });
    },
  });
}

export function useOfficeInvoicesQuery(params: PageParams) {
  return useQuery({ queryKey: [KEY, 'invoices', params], queryFn: () => financeApi.invoices(params) });
}

export function useCreateInvoiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvoiceRequest) => financeApi.createInvoice(body),
    onSuccess: () => {
      notifySuccess('Cobrança criada.');
      qc.invalidateQueries({ queryKey: [KEY, 'invoices'] });
    },
  });
}

// Polling curto enquanto o status estiver pendente (aguardando webhook do gateway).
export function useInvoiceDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'invoice', id],
    queryFn: () => financeApi.invoice(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status as InvoiceStatus | undefined;
      return status === 'PENDENTE' ? 8000 : false;
    },
  });
}

export function useOverdueReceivablesQuery() {
  return useQuery({ queryKey: [KEY, 'overdue'], queryFn: financeApi.overdue });
}
