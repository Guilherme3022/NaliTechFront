import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { AuthShell } from '../components/AuthShell';
import { useForgotPassword } from '../hooks';

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => forgot.mutate(values));

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link de redefinição por e-mail">
      {forgot.isSuccess ? (
        <Stack spacing={2}>
          <Alert severity="success">
            Se este e-mail estiver cadastrado, você receberá as instruções em instantes.
          </Alert>
          <Link component={RouterLink} to="/login">
            Voltar para o login
          </Link>
        </Stack>
      ) : (
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" variant="contained" size="large" disabled={forgot.isPending}>
              {forgot.isPending ? 'Enviando...' : 'Enviar link'}
            </Button>
            <Typography variant="body2" textAlign="center">
              <Link component={RouterLink} to="/login">
                Voltar para o login
              </Link>
            </Typography>
          </Stack>
        </Box>
      )}
    </AuthShell>
  );
}
