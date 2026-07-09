import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  CreateFeeRequest,
  CreateInvoiceRequest,
  FeeResponse,
  InvoiceResponse,
} from './types';

export const financeApi = {
  fees: () => api.get<FeeResponse[]>('/office/fees').then((r) => r.data),
  createFee: (body: CreateFeeRequest) => api.post<FeeResponse>('/office/fees', body).then((r) => r.data),
  invoices: (params: PageParams) =>
    api.get<Page<InvoiceResponse>>('/office/invoices', { params }).then((r) => r.data),
  invoice: (id: string) => api.get<InvoiceResponse>(`/office/invoices/${id}`).then((r) => r.data),
  createInvoice: (body: CreateInvoiceRequest) =>
    api.post<InvoiceResponse>('/office/invoices', body).then((r) => r.data),
  overdue: () => api.get<InvoiceResponse[]>('/office/receivables/overdue').then((r) => r.data),
};
