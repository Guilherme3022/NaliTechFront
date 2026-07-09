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
import { ClientSelect } from '@/modules/clients/components/ClientSelect';
import { useCreateFeeMutation } from '../hooks';

const schema = z.object({
  clienteId: z.string().min(1, 'Selecione o cliente'),
  descricao: z.string().optional(),
  valor: z.string().min(1, 'Informe o valor'),
  periodicidade: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function FeeFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateFeeMutation();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clienteId: '', descricao: '', valor: '', periodicidade: 'MENSAL' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync({
      clienteId: values.clienteId,
      descricao: values.descricao,
      valor: Number(values.valor),
      periodicidade: values.periodicidade,
    });
    reset();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo honorário</DialogTitle>
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
            <TextField label="Descrição" fullWidth {...register('descricao')} />
            <TextField
              label="Valor (R$)"
              type="number"
              fullWidth
              error={!!errors.valor}
              helperText={errors.valor?.message}
              {...register('valor')}
            />
            <Controller
              name="periodicidade"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Periodicidade</InputLabel>
                  <Select label="Periodicidade" {...field}>
                    <MenuItem value="MENSAL">Mensal</MenuItem>
                    <MenuItem value="TRIMESTRAL">Trimestral</MenuItem>
                    <MenuItem value="ANUAL">Anual</MenuItem>
                    <MenuItem value="AVULSO">Avulso</MenuItem>
                  </Select>
                </FormControl>
              )}
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
