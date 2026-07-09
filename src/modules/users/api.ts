import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '@/modules/auth/types';

export const usersApi = {
  list: (params: PageParams) =>
    api.get<Page<UserResponse>>('/users', { params }).then((r) => r.data),
  create: (body: CreateUserRequest) =>
    api.post<UserResponse>('/users', body).then((r) => r.data),
  update: (id: string, body: UpdateUserRequest) =>
    api.put<UserResponse>(`/users/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`),
};
