import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifySuccess } from '@/shared/lib/notify';
import { companyApi } from './api';
import type { CreateCompanyRequest, UpdateCompanyRequest } from './types';

const KEY = 'company';

// E2.3 — hooks de empresa.
export function useCompanyQuery() {
  return useQuery({ queryKey: [KEY], queryFn: companyApi.current });
}

export function useUpdateCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCompanyRequest }) =>
      companyApi.update(id, body),
    onSuccess: () => {
      notifySuccess('Dados da empresa atualizados.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useCreateCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompanyRequest) => companyApi.create(body),
    onSuccess: () => {
      notifySuccess('Empresa cadastrada.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
