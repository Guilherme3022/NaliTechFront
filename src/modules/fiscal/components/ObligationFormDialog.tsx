import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { ClientSelect } from '@/modules/clients/components/ClientSelect';
import { useCreateObligationMutation } from '../hooks';

const schema = z.object({
  clienteId: z.string().nullable(),
  tipo: z.string().min(1, 'Informe o tipo'),
  descricao: z.string().optional(),
  vencimento: z.string().min(1, 'Informe o vencimento'),
});
type FormValues = z.infer<typeof schema>;

export function ObligationFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateObligationMutation();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clienteId: null, tipo: '', descricao: '', vencimento: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync({
      clienteId: values.clienteId,
      tipo: values.tipo,
      descricao: values.descricao,
      vencimento: values.vencimento,
      status: 'PENDENTE',
    });
    reset();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova obrigação fiscal</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="clienteId"
              control={control}
              render={({ field }) => (
                <ClientSelect value={field.value} onChange={field.onChange} label="Cliente (opcional)" />
              )}
            />
            <TextField
              label="Tipo (ex: DAS, DCTF, GFIP)"
              fullWidth
              error={!!errors.tipo}
              helperText={errors.tipo?.message}
              {...register('tipo')}
            />
            <TextField label="Descrição" fullWidth {...register('descricao')} />
            <TextField
              label="Vencimento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.vencimento}
              helperText={errors.vencimento?.message}
              {...register('vencimento')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={create.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={create.isPending}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
