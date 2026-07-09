import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  useDeleteWebhookSubscriptionMutation,
  useTestWebhookMutation,
  useWebhookSubscriptionsQuery,
} from '../hooks';
import { WebhookSubscriptionForm } from '../components/WebhookSubscriptionForm';
import { WebhookDeliveryLog } from '../components/WebhookDeliveryLog';
import { ApiKeysPage } from './ApiKeysPage';
import type { SubscriptionResponse } from '../types';

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = location.pathname.endsWith('/api-keys') ? 1 : 0;

  return (
    <>
      <PageHeader title="Configurações" subtitle="Integrações e automação (n8n)" />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => navigate(v === 0 ? '/settings/webhooks' : '/settings/api-keys')}
        >
          <Tab label="Webhooks" />
          <Tab label="Chaves de API" />
        </Tabs>
      </Box>
      {tab === 0 ? <WebhooksTab /> : <ApiKeysPage />}
    </>
  );
}

function WebhooksTab() {
  const query = useWebhookSubscriptionsQuery();
  const del = useDeleteWebhookSubscriptionMutation();
  const test = useTestWebhookMutation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<SubscriptionResponse | null>(null);

  if (query.isLoading) return <LoadingState rows={3} />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  return (
    <>
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nova assinatura
        </Button>
      </Box>

      {(query.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhum webhook configurado"
          description="Crie assinaturas para enviar eventos do LedgerFlow ao n8n e automatizar fluxos."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Criar assinatura
            </Button>
          }
        />
      ) : (
        <Stack spacing={2}>
          {query.data!.map((sub) => (
            <Card key={sub.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={sub.evento} color="secondary" />
                      <Chip
                        size="small"
                        label={sub.ativo ? 'Ativa' : 'Inativa'}
                        color={sub.ativo ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {sub.urlDestino}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<ScienceIcon />}
                      disabled={test.isPending}
                      onClick={() => test.mutate(sub.id)}
                    >
                      Testar
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    >
                      {expanded === sub.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => setToDelete(sub)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                <Collapse in={expanded === sub.id} unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Log de entregas
                    </Typography>
                    <WebhookDeliveryLog subscriptionId={sub.id} />
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <WebhookSubscriptionForm open={open} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover assinatura"
        message={`Remover a assinatura do evento "${toDelete?.evento}"?`}
        confirmLabel="Remover"
        confirmColor="error"
        loading={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await del.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}
