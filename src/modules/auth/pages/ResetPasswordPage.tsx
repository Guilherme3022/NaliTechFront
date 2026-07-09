import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material';
import { AuthShell } from '../components/AuthShell';
import { useResetPassword } from '../hooks';
import { notifySuccess } from '@/shared/lib/notify';

// A senha deve ser forte (o backend valida com @StrongPassword).
const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula')
      .regex(/[a-z]/, 'Inclua ao menos uma letra minúscula')
      .regex(/[0-9]/, 'Inclua ao menos um número'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'As senhas não conferem',
    path: ['confirm'],
  });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const reset = useResetPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    await reset.mutateAsync({ token, newPassword: values.newPassword });
    notifySuccess('Senha redefinida com sucesso. Faça login.');
    navigate('/login', { replace: true });
  });

  if (!token) {
    return (
      <AuthShell title="Redefinir senha">
        <Alert severity="error">Link inválido ou expirado. Solicite uma nova redefinição.</Alert>
        <Box sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/forgot-password">
            Solicitar novo link
          </Link>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta">
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Nova senha"
            type="password"
            fullWidth
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <TextField
            label="Confirmar senha"
            type="password"
            fullWidth
            error={!!errors.confirm}
            helperText={errors.confirm?.message}
            {...register('confirm')}
          />
          <Button type="submit" variant="contained" size="large" disabled={reset.isPending}>
            {reset.isPending ? 'Salvando...' : 'Redefinir senha'}
          </Button>
        </Stack>
      </Box>
    </AuthShell>
  );
}
