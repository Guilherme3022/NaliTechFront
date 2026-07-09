import { api } from '@/shared/lib/api';
import type { Page } from '@/shared/types';
import type { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from './types';

export const companyApi = {
  // Config única do escritório: usamos a primeira empresa cadastrada.
  current: async (): Promise<CompanyResponse | null> => {
    const { data } = await api.get<Page<CompanyResponse>>('/companies', { params: { size: 1 } });
    return data.content[0] ?? null;
  },
  create: (body: CreateCompanyRequest) =>
    api.post<CompanyResponse>('/companies', body).then((r) => r.data),
  update: (id: string, body: UpdateCompanyRequest) =>
    api.put<CompanyResponse>(`/companies/${id}`, body).then((r) => r.data),
};
