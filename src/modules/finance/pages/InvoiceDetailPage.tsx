import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { useClientName } from '@/modules/clients/useClientName';
import { useInvoiceDetailQuery } from '../hooks';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { PixQrCodeCard } from '../components/PixQrCodeCard';
import { BoletoLinkButton } from '../components/BoletoLinkButton';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useInvoiceDetailQuery(id);
  const clientName = useClientName();

  return (
    <>
      <PageHeader
        title="Detalhe da cobrança"
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/finance')}>
            Voltar
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState rows={4} />
      ) : query.isError || !query.data ? (
        <ErrorState onRetry={query.refetch} />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h5">{formatCurrency(query.data.valor)}</Typography>
                  <InvoiceStatusBadge status={query.data.status} />
                </Stack>
                <Grid container spacing={2}>
                  <Info label="Cliente" value={clientName(query.data.clienteId)} />
                  <Info label="Vencimento" value={formatDate(query.data.vencimento)} />
                  <Info label="Gateway" value={query.data.provider ?? '—'} />
                  <Info label="ID externo" value={query.data.externalId ?? '—'} />
                </Grid>
                {query.data.status === 'PENDENTE' && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Aguardando confirmação de pagamento do gateway (atualiza automaticamente).
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              {query.data.pixCopiaCola && <PixQrCodeCard pixCopiaCola={query.data.pixCopiaCola} />}
              {query.data.boletoUrl && (
                <Box>
                  <BoletoLinkButton boletoUrl={query.data.boletoUrl} />
                </Box>
              )}
              {!query.data.pixCopiaCola && !query.data.boletoUrl && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum meio de pagamento disponível ainda. Se o gateway estiver em modo simulado,
                      boleto/PIX podem não ser gerados.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Grid>
  );
}
