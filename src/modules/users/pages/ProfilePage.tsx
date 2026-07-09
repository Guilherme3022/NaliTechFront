import { Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/modules/auth/AuthContext';
import { useForgotPassword } from '@/modules/auth/hooks';
import { notifySuccess } from '@/shared/lib/notify';

export function ProfilePage() {
  const { user } = useAuth();
  const forgot = useForgotPassword();

  if (!user) return null;

  // O backend não expõe troca direta de senha autenticada; a redefinição
  // acontece pelo fluxo de recuperação (envio de link ao e-mail do usuário).
  const handleChangePassword = async () => {
    await forgot.mutateAsync({ email: user.email });
    notifySuccess('Enviamos um link de redefinição de senha para o seu e-mail.');
  };

  return (
    <>
      <PageHeader title="Meu perfil" subtitle="Seus dados de acesso" />
      <Card variant="outlined" sx={{ maxWidth: 560 }}>
        <CardContent>
          <Stack spacing={2}>
            <div>
              <Typography variant="caption" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1">{user.name}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary">
                E-mail
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary" display="block">
                Perfis
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                {user.roles.map((r) => (
                  <Chip key={r} label={r} size="small" />
                ))}
              </Stack>
            </div>
            <Divider />
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Segurança
              </Typography>
              <Button variant="outlined" onClick={handleChangePassword} disabled={forgot.isPending}>
                {forgot.isPending ? 'Enviando...' : 'Trocar senha'}
              </Button>
            </div>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
