import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { AuthShell } from '../components/AuthShell';
import { useLogin } from '../hooks';
import { useAuth } from '../AuthContext';

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    const res = await login.mutateAsync(values);
    await setSession(res.accessToken, res.refreshToken);
    navigate(location.state?.from?.pathname ?? '/', { replace: true });
  });

  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta LedgerFlow">
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          {login.isError && (
            // Mensagem clara, sem detalhe técnico exposto (E1.1).
            <Alert severity="error">E-mail ou senha incorretos.</Alert>
          )}
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="current-password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </Button>
          <Typography variant="body2" textAlign="center">
            <Link component={RouterLink} to="/forgot-password">
              Esqueci minha senha
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthShell>
  );
}
