import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { PageHeader } from '@/shared/components/PageHeader';
import { FileDropzone } from '@/shared/components/FileDropzone';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { notifyError } from '@/shared/lib/notify';
import {
  useUploadsQuery,
  useSubstituteUploadMutation,
  useUploadFileMutation,
} from '@/modules/uploads/hooks';
import { conciliacoesApi } from '../api';
import {
  useAttachUploadMutation,
  useCancelarConciliacaoMutation,
  useConciliacaoQuery,
  useConcluirConciliacaoMutation,
} from '../hooks';

export function ConciliacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useConciliacaoQuery(id);
  const attach = useAttachUploadMutation();
  const substitute = useSubstituteUploadMutation();
  const uploadFile = useUploadFileMutation();
  const concluir = useConcluirConciliacaoMutation();
  const cancelar = useCancelarConciliacaoMutation();
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const conciliacao = query.data;
  const uploadsQuery = useUploadsQuery({
    page: 0,
    size: 100,
    clienteId: conciliacao?.clienteId,
  });

  if (query.isLoading) return <LoadingState rows={4} />;
  if (query.isError || !conciliacao) return <ErrorState onRetry={query.refetch} />;

  const encerrada = conciliacao.situacao === 'CONCLUIDA' || conciliacao.situacao === 'CANCELADA';

  const enviarEAnexar = (files: File[]) => {
    files.forEach((file) => {
      uploadFile.mutate(
        { file, clienteId: conciliacao.clienteId },
        { onSuccess: (up) => attach.mutate({ id: conciliacao.id, uploadId: up.id }) },
      );
    });
  };

  const download = async (formato: 'TXT' | 'CSV') => {
    try {
      const blob = await conciliacoesApi.download(conciliacao.id, formato);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conciliacao-${conciliacao.id.slice(0, 8)}.${formato.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notifyError('Nao foi possivel baixar o arquivo.');
    }
  };

  return (
    <>
      <PageHeader title={`Conciliação ${conciliacao.id.slice(0, 8)}`} subtitle="Detalhe do lote" />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Chip label={conciliacao.situacao} />
            <Typography variant="body2">Competência: {conciliacao.competencia}</Typography>
            <Box sx={{ flex: 1 }} />
            {conciliacao.situacao === 'CONCLUIDA' ? (
              <>
                <Button startIcon={<DownloadIcon />} onClick={() => download('TXT')}>
                  TXT
                </Button>
                <Button startIcon={<DownloadIcon />} onClick={() => download('CSV')}>
                  CSV
                </Button>
              </>
            ) : conciliacao.situacao === 'CANCELADA' ? null : (
              <>
                <Button variant="contained" disabled={concluir.isPending} onClick={() => concluir.mutate(conciliacao.id)}>
                  Concluir
                </Button>
                <Button color="error" disabled={cancelar.isPending} onClick={() => cancelar.mutate(conciliacao.id)}>
                  Cancelar
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {!encerrada && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Enviar arquivo para esta conciliação
          </Typography>
          <FileDropzone onFiles={enviarEAnexar} />
        </Box>
      )}

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Arquivos do cliente
      </Typography>
      {uploadsQuery.isLoading ? (
        <LoadingState rows={3} />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Arquivo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(uploadsQuery.data?.content ?? []).map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.nomeOriginal}</TableCell>
                <TableCell>{u.status}</TableCell>
                <TableCell sx={{ color: u.erroMensagem ? 'error.main' : 'text.secondary', fontSize: 13 }}>
                  {u.erroMensagem ?? (u.etapaAtual ?? '—')}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => navigate(`/uploads/${u.id}`)}>
                    Detalhe
                  </Button>
                  <input
                    type="file"
                    hidden
                    ref={(el) => {
                      fileInputs.current[u.id] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) substitute.mutate({ id: u.id, file });
                      e.target.value = '';
                    }}
                  />
                  <Button size="small" onClick={() => fileInputs.current[u.id]?.click()}>
                    Substituir
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={encerrada || attach.isPending}
                    onClick={() => attach.mutate({ id: conciliacao.id, uploadId: u.id })}
                  >
                    Anexar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
