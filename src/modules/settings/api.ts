import { api } from '@/shared/lib/api';
import type { Page, PageParams } from '@/shared/types';
import type {
  ApiKeyResponse,
  CreateApiKeyRequest,
  CreateSubscriptionRequest,
  CreatedApiKeyResponse,
  SubscriptionResponse,
  WebhookDelivery,
} from './types';

export const settingsApi = {
  // Webhooks
  subscriptions: () => api.get<SubscriptionResponse[]>('/webhooks/subscriptions').then((r) => r.data),
  createSubscription: (body: CreateSubscriptionRequest) =>
    api.post<SubscriptionResponse>('/webhooks/subscriptions', body).then((r) => r.data),
  deleteSubscription: (id: string) => api.delete(`/webhooks/subscriptions/${id}`),
  testSubscription: (id: string) => api.post(`/webhooks/subscriptions/${id}/test`),
  deliveries: (subscriptionId: string, params: PageParams) =>
    api
      .get<Page<WebhookDelivery>>('/webhooks/subscriptions/deliveries', {
        params: { subscriptionId, ...params },
      })
      .then((r) => r.data),

  // API keys
  apiKeys: () => api.get<ApiKeyResponse[]>('/api-keys').then((r) => r.data),
  createApiKey: (body: CreateApiKeyRequest) =>
    api.post<CreatedApiKeyResponse>('/api-keys', body).then((r) => r.data),
  revokeApiKey: (id: string) => api.delete(`/api-keys/${id}`),
};
