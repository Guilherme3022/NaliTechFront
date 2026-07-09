import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { WEBHOOK_EVENTS } from '../types';
import { useCreateWebhookSubscriptionMutation } from '../hooks';

const schema = z.object({
  evento: z.string().min(1, 'Selecione o evento'),
  urlDestino: z.string().url('Informe uma URL válida (ex: webhook do n8n)'),
});
type FormValues = z.infer<typeof schema>;

// E17.1 — seleciona o evento do catálogo e informa a URL de destino do n8n.
export function WebhookSubscriptionForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateWebhookSubscriptionMutation();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { evento: '', urlDestino: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync(values);
    reset();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova assinatura de webhook</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="evento"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.evento}>
                  <InputLabel>Evento</InputLabel>
                  <Select label="Evento" {...field}>
                    {WEBHOOK_EVENTS.map((ev) => (
                      <MenuItem key={ev} value={ev}>
                        {ev}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <TextField
              label="URL de destino (n8n)"
              placeholder="https://n8n.seudominio.com/webhook/..."
              fullWidth
              error={!!errors.urlDestino}
              helperText={errors.urlDestino?.message ?? 'O segredo (HMAC) é gerado automaticamente na criação.'}
              {...register('urlDestino')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={create.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={create.isPending}>
            Criar assinatura
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
