import { Box, Typography } from '@mui/material';
import type { UploadResponse } from '../types';
import { formatDateTime } from '@/shared/lib/format';

// O backend ainda não expõe um endpoint de log detalhado; montamos uma linha do
// tempo simples a partir dos campos do próprio upload (recebido → etapa atual →
// erro/concluído). Quando o endpoint de eventos existir, basta trocar a fonte.
export function ProcessingLog({ upload }: { upload: UploadResponse }) {
  const events: { label: string; when: string; tone?: 'error' | 'success' }[] = [
    { label: `Arquivo recebido (${upload.nomeOriginal})`, when: upload.createdAt },
  ];
  if (upload.etapaAtual) {
    events.push({ label: `Etapa atual: ${upload.etapaAtual}`, when: upload.createdAt });
  }
  if (upload.status === 'ERRO') {
    events.push({ label: upload.erroMensagem ?? 'Falha no processamento', when: upload.createdAt, tone: 'error' });
  }
  if (upload.status === 'CONCLUIDO') {
    events.push({ label: 'Processamento concluído', when: upload.createdAt, tone: 'success' });
  }

  return (
    <Box>
      {events.map((ev, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, py: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
          <Box>
            <Typography
              variant="body2"
              color={ev.tone === 'error' ? 'error.main' : ev.tone === 'success' ? 'success.main' : 'text.primary'}
            >
              {ev.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(ev.when)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
