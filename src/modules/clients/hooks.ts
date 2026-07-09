import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { clientsApi } from './api';
import type { CreateClientRequest, UpdateClientRequest } from './types';

const KEY = 'clients';

// E3.4 — hooks de clientes.
export function useClientsQuery(params: PageParams & { search?: string }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => clientsApi.list(params) });
}

// Lista ampla usada em selects e mapeamento id -> nome (financeiro, fiscal).
export function useClientOptionsQuery() {
  return useQuery({
    queryKey: [KEY, 'options'],
    queryFn: () => clientsApi.list({ page: 0, size: 500 }),
    staleTime: 60_000,
  });
}

export function useClientQuery(id: string | undefined) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => clientsApi.getById(id!), enabled: !!id });
}

export function useClientDocumentsQuery(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, id, 'documents'],
    queryFn: () => clientsApi.documents(id!),
    enabled: !!id,
  });
}

export function useCreateClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClientRequest) => clientsApi.create(body),
    onSuccess: () => {
      notifySuccess('Cliente cadastrado.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useUpdateClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateClientRequest }) =>
      clientsApi.update(id, body),
    onSuccess: () => {
      notifySuccess('Cliente atualizado.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      notifySuccess('Cliente removido.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
