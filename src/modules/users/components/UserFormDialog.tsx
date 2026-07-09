import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import type { RoleName, UserResponse, UserStatus } from '@/modules/auth/types';
import { useCreateUserMutation, useUpdateUserMutation } from '../hooks';

const ROLES: RoleName[] = ['ADMIN', 'CONTADOR', 'AUXILIAR', 'CLIENTE'];

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional(),
  roles: z.array(z.enum(['ADMIN', 'CONTADOR', 'AUXILIAR', 'CLIENTE'])).min(1, 'Selecione ao menos um perfil'),
  status: z.enum(['ATIVO', 'INATIVO']),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
}

export function UserFormDialog({ open, user, onClose }: Props) {
  const isEdit = !!user;
  const create = useCreateUserMutation();
  const update = useUpdateUserMutation();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', roles: [], status: 'ATIVO' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        roles: user?.roles ?? [],
        status: user?.status ?? 'ATIVO',
      });
    }
  }, [open, user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && user) {
      await update.mutateAsync({
        id: user.id,
        body: { name: values.name, roles: values.roles as RoleName[], status: values.status as UserStatus },
      });
    } else {
      if (!values.password || values.password.length < 8) {
        // validação mínima no create
        return;
      }
      await create.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        roles: values.roles as RoleName[],
      });
    }
    onClose();
  });

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              disabled={isEdit}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            {!isEdit && (
              <TextField
                label="Senha"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message ?? 'Mínimo 8 caracteres, com maiúscula, minúscula e número'}
                {...register('password')}
              />
            )}
            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.roles}>
                  <InputLabel>Perfis</InputLabel>
                  <Select
                    multiple
                    label="Perfis"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    {ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        <Checkbox checked={field.value.includes(role)} />
                        <ListItemText primary={role} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
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
