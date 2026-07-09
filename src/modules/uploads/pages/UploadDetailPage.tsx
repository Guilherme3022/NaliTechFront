import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { formatBytes } from '@/shared/lib/format';
import { useUploadDetailQuery } from '../hooks';
import { PipelineStepper } from '../components/PipelineStepper';
import { ProcessingLog } from '../components/ProcessingLog';
import { UploadStatusChip } from '../components/UploadStatusChip';

export function UploadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useUploadDetailQuery(id);

  return (
    <>
      <PageHeader
        title="Detalhe do processamento"
        subtitle="Acompanhe cada etapa do pipeline"
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/uploads')}>
            Voltar
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState rows={4} />
      ) : query.isError || !query.data ? (
        <ErrorState onRetry={query.refetch} />
      ) : (
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <div>
                  <Typography variant="h6">{query.data.nomeOriginal}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {query.data.tipoMime} · {formatBytes(query.data.tamanho)}
                  </Typography>
                </div>
                <UploadStatusChip status={query.data.status} />
              </Stack>
              <PipelineStepper status={query.data.status} etapa={query.data.etapaAtual} />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Eventos</Typography>
                {query.data.status === 'ERRO' && (
                  // O backend não expõe reprocessamento; a recuperação é reenviar o arquivo.
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<ReplayIcon />}
                    onClick={() => navigate('/uploads')}
                  >
                    Reenviar arquivo
                  </Button>
                )}
              </Stack>
              <ProcessingLog upload={query.data} />
              {query.data.status === 'CONCLUIDO' && (
                <Chip
                  sx={{ mt: 2 }}
                  color="success"
                  label="Movimentações prontas — verifique a Conciliação"
                  onClick={() => navigate('/reconciliation')}
                />
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </>
  );
}
