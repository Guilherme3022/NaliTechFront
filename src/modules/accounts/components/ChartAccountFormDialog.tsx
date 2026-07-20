import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useCreateChartAccountMutation, useUpdateChartAccountMutation } from '../hooks';
import type { ChartAccountResponse } from '../types';
import { ClientScopeSelect } from './ClientScopeSelect';

const schema = z.object({
  codigo: z.string().min(1, 'Informe o código'),
  nome: z.string().min(1, 'Informe o nome'),
  tipo: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  account: ChartAccountResponse | null;
  parentId?: string | null;
  onClose: () => void;
}

export function ChartAccountFormDialog({ open, account, parentId, onClose }: Props) {
  const isEdit = !!account;
  const create = useCreateChartAccountMutation();
  const update = useUpdateChartAccountMutation();

  const [clienteId, setClienteId] = useState<string | null>(null);
  // Natureza: 'auto' (deixa o sistema inferir pela hierarquia), 'A' (analítica) ou 'S' (sintética).
  const [natureza, setNatureza] = useState<'auto' | 'A' | 'S'>('auto');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: '', nome: '', tipo: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ codigo: account?.codigo ?? '', nome: account?.nome ?? '', tipo: account?.tipo ?? '' });
      setClienteId(account?.clienteId ?? null);
      setNatureza(account?.analitica === true ? 'A' : account?.analitica === false ? 'S' : 'auto');
    }
  }, [open, account, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const analitica = natureza === 'auto' ? null : natureza === 'A';
    const body = { ...values, analitica, parentId: account?.parentId ?? parentId ?? null, clienteId };
    if (isEdit && account) {
      await update.mutateAsync({ id: account.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  });

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar conta' : 'Nova conta'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Código"
              fullWidth
              error={!!errors.codigo}
              helperText={errors.codigo?.message}
              {...register('codigo')}
            />
            <TextField
              label="Nome"
              fullWidth
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register('nome')}
            />
            <TextField label="Tipo (ex: RECEITA, DESPESA)" fullWidth {...register('tipo')} />
            <TextField
              select
              label="Natureza"
              fullWidth
              value={natureza}
              onChange={(e) => setNatureza(e.target.value as 'auto' | 'A' | 'S')}
              helperText="Analítica recebe lançamento; sintética é agrupadora."
            >
              <MenuItem value="auto">Automática (pela hierarquia)</MenuItem>
              <MenuItem value="A">Analítica (lançável)</MenuItem>
              <MenuItem value="S">Sintética (agrupadora)</MenuItem>
            </TextField>
            <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
