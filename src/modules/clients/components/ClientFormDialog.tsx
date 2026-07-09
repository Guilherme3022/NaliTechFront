import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
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
import { useEffect } from 'react';
import { maskCpfCnpj } from '@/shared/lib/format';
import { useCreateClientMutation, useUpdateClientMutation } from '../hooks';
import type { ClientResponse, ClientStatus } from '../types';

const schema = z.object({
  nome: z.string().min(1, 'Informe o nome'),
  cnpjCpf: z.string().min(11, 'CPF/CNPJ inválido'),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  status: z.enum(['ATIVO', 'INATIVO']),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  client: ClientResponse | null;
  onClose: () => void;
}

export function ClientFormDialog({ open, client, onClose }: Props) {
  const isEdit = !!client;
  const create = useCreateClientMutation();
  const update = useUpdateClientMutation();

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { nome: '', cnpjCpf: '', contato: '', telefone: '', email: '', status: 'ATIVO' },
    });

  useEffect(() => {
    if (open) {
      reset({
        nome: client?.nome ?? '',
        cnpjCpf: client?.cnpjCpf ?? '',
        contato: client?.contato ?? '',
        telefone: client?.telefone ?? '',
        email: client?.email ?? '',
        status: client?.status ?? 'ATIVO',
      });
    }
  }, [open, client, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && client) {
      await update.mutateAsync({
        id: client.id,
        body: {
          nome: values.nome,
          contato: values.contato,
          telefone: values.telefone,
          email: values.email || undefined,
          status: values.status as ClientStatus,
        },
      });
    } else {
      await create.mutateAsync({
        nome: values.nome,
        cnpjCpf: values.cnpjCpf,
        contato: values.contato,
        telefone: values.telefone,
        email: values.email || undefined,
      });
    }
    onClose();
  });

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome / Razão social"
              fullWidth
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register('nome')}
            />
            <TextField
              label="CPF / CNPJ"
              fullWidth
              disabled={isEdit}
              value={watch('cnpjCpf')}
              onChange={(e) => setValue('cnpjCpf', maskCpfCnpj(e.target.value))}
              error={!!errors.cnpjCpf}
              helperText={errors.cnpjCpf?.message}
            />
            <TextField label="Contato" fullWidth {...register('contato')} />
            <TextField label="Telefone" fullWidth {...register('telefone')} />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            {isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" {...field}>
                      <MenuItem value="ATIVO">Ativo</MenuItem>
                      <MenuItem value="INATIVO">Inativo</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
