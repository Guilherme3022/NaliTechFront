import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { notifySuccess } from '@/shared/lib/notify';
import { settingsApi } from './api';
import type { CreateApiKeyRequest, CreateSubscriptionRequest } from './types';

const SUBS = 'webhook-subscriptions';
const KEYS = 'api-keys';

// E17.5 — hooks de webhooks e chaves de API.
export function useWebhookSubscriptionsQuery() {
  return useQuery({ queryKey: [SUBS], queryFn: settingsApi.subscriptions });
}

export function useCreateWebhookSubscriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubscriptionRequest) => settingsApi.createSubscription(body),
    onSuccess: () => {
      notifySuccess('Assinatura de webhook criada.');
      qc.invalidateQueries({ queryKey: [SUBS] });
    },
  });
}

export function useDeleteWebhookSubscriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteSubscription(id),
    onSuccess: () => {
      notifySuccess('Assinatura removida.');
      qc.invalidateQueries({ queryKey: [SUBS] });
    },
  });
}

export function useTestWebhookMutation() {
  return useMutation({
    mutationFn: (id: string) => settingsApi.testSubscription(id),
    onSuccess: () => notifySuccess('Evento de teste disparado.'),
  });
}

export function useWebhookDeliveriesQuery(subscriptionId: string | undefined, params: PageParams) {
  return useQuery({
    queryKey: ['webhook-deliveries', subscriptionId, params],
    queryFn: () => settingsApi.deliveries(subscriptionId!, params),
    enabled: !!subscriptionId,
  });
}

export function useApiKeysQuery() {
  return useQuery({ queryKey: [KEYS], queryFn: settingsApi.apiKeys });
}

export function useCreateApiKeyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateApiKeyRequest) => settingsApi.createApiKey(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS] }),
  });
}

export function useRevokeApiKeyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.revokeApiKey(id),
    onSuccess: () => {
      notifySuccess('Chave revogada.');
      qc.invalidateQueries({ queryKey: [KEYS] });
    },
  });
}
