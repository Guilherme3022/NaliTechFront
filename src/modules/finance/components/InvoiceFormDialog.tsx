import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { ClientSelect } from '@/modules/clients/components/ClientSelect';
import { useCreateInvoiceMutation } from '../hooks';

const schema = z.object({
  clienteId: z.string().min(1, 'Selecione o cliente'),
  valor: z.string().min(1, 'Informe o valor'),
  vencimento: z.string().min(1, 'Informe o vencimento'),
  descricao: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function InvoiceFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateInvoiceMutation();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clienteId: '', valor: '', vencimento: '', descricao: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync({
      clienteId: values.clienteId,
      valor: Number(values.valor),
      vencimento: values.vencimento,
      descricao: values.descricao,
    });
    reset();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova cobrança</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="clienteId"
              control={control}
              render={({ field }) => (
                <ClientSelect
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  error={!!errors.clienteId}
                  helperText={errors.clienteId?.message}
                />
              )}
            />
            <TextField
              label="Valor (R$)"
              type="number"
              fullWidth
              error={!!errors.valor}
              helperText={errors.valor?.message}
              {...register('valor')}
            />
            <TextField
              label="Vencimento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.vencimento}
              helperText={errors.vencimento?.message}
              {...register('vencimento')}
            />
            <TextField label="Descrição" fullWidth {...register('descricao')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={create.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={create.isPending}>
            Gerar cobrança
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
