import axios from 'axios';
import { tokenStorage } from '@/shared/lib/tokenStorage';
import { api } from '@/shared/lib/api';
import type { NotificationItem } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// Cliente "silencioso" sem o interceptor global de erro: se o endpoint de
// notificações ainda não existir no backend, o sino apenas fica vazio, sem
// poluir a tela com toasts de erro.
const silentClient = axios.create({ baseURL });

export const notificationsApi = {
  list: async (): Promise<NotificationItem[]> => {
    try {
      const token = tokenStorage.getAccess();
      const { data } = await silentClient.get<NotificationItem[]>('/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return data;
    } catch {
      return [];
    }
  },
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
};
