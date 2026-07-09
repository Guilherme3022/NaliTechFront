import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { usersApi } from './api';
import type { CreateUserRequest, UpdateUserRequest } from '@/modules/auth/types';

const KEY = 'users';

// E1.6 — hooks de usuários.
export function useUsersQuery(params: PageParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => usersApi.list(params) });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserRequest) => usersApi.create(body),
    onSuccess: () => {
      notifySuccess('Usuário criado com sucesso.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserRequest }) =>
      usersApi.update(id, body),
    onSuccess: () => {
      notifySuccess('Usuário atualizado.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      notifySuccess('Usuário removido.');
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
