import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifySuccess } from '@/shared/lib/notify';
import { planoModelosApi } from './api';
import type { ContaRequest, CreatePlanoModeloRequest } from './types';

const KEY = 'plano-modelos';

export function usePlanoModelosQuery() {
  return useQuery({ queryKey: [KEY], queryFn: planoModelosApi.list });
}

export function usePlanoModeloQuery(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => planoModelosApi.get(id!),
    enabled: !!id,
  });
}

export function useCreatePlanoModeloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePlanoModeloRequest) => planoModelosApi.create(body),
    onSuccess: () => {
      notifySuccess('Modelo criado.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useAddContaMutation(modeloId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ContaRequest) => planoModelosApi.addConta(modeloId, body),
    onSuccess: () => {
      notifySuccess('Conta adicionada.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useAplicarModeloMutation(modeloId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clienteId: string) => planoModelosApi.aplicar(modeloId, clienteId),
    onSuccess: (res) => {
      notifySuccess(`Aplicado: ${res.contasCriadas} conta(s) criada(s), ${res.contasIgnoradas} já existentes.`);
      qc.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    },
  });
}

export function useDeletePlanoModeloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => planoModelosApi.remove(id),
    onSuccess: () => {
      notifySuccess('Modelo removido.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
