import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useQueryClient } from '@tanstack/react-query';
import { notifySuccess } from '@/shared/lib/notify';
import { useAiSweepActiveQuery } from '../hooks';
import type { AiSweepJob } from '../types';

/**
 * Popup global (canto inferior direito, estilo "upload do Drive") que acompanha
 * as varreduras por IA em andamento. Fica montado no layout, entao sobrevive a
 * navegacao entre telas: o usuario dispara a IA e continua trabalhando.
 */
export function AiSweepPopup() {
  const qc = useQueryClient();
  const query = useAiSweepActiveQuery();
  const jobs = query.data ?? [];

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const handledDone = useRef<Set<string>>(new Set());

  // Ao concluir um job: avisa e recarrega a lista de pendencias (as resolvidas saem).
  useEffect(() => {
    for (const job of jobs) {
      const finished = job.status === 'CONCLUIDO' || job.status === 'ERRO';
      if (finished && !handledDone.current.has(job.jobId)) {
        handledDone.current.add(job.jobId);
        if (job.status === 'CONCLUIDO') {
          notifySuccess(`IA concluiu: ${job.resolvidos} de ${job.total} conciliada(s).`);
          qc.invalidateQueries({ queryKey: ['reconciliations'] });
        }
      }
    }
  }, [jobs, qc]);

  const visible = jobs.filter((j) => j.status !== 'SEM_PENDENCIAS' && !dismissed.has(j.jobId));
  if (visible.length === 0) return null;

  const dismiss = (jobId: string) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: (t) => t.zIndex.snackbar + 1,
        width: 340,
        maxWidth: '90vw',
      }}
    >
      <Stack spacing={1.5}>
        {visible.map((job) => (
          <JobCard key={job.jobId} job={job} onDismiss={() => dismiss(job.jobId)} />
        ))}
      </Stack>
    </Box>
  );
}

function JobCard({ job, onDismiss }: { job: AiSweepJob; onDismiss: () => void }) {
  const running = job.status === 'EXECUTANDO';
  const erro = job.status === 'ERRO';
  const pct = job.total > 0 ? Math.round((job.processados / job.total) * 100) : 100;

  const titulo = running
    ? 'Validando pendências com IA…'
    : erro
      ? 'Falha na validação por IA'
      : 'Validação por IA concluída';

  return (
    <Card variant="outlined" sx={{ boxShadow: 4 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <AutoAwesomeIcon fontSize="small" color="secondary" />
          <Typography variant="subtitle2" sx={{ flex: 1 }} noWrap>
            {titulo}
          </Typography>
          {!running && (
            <IconButton size="small" onClick={onDismiss} aria-label="Fechar">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <LinearProgress
          variant={running && job.total === 0 ? 'indeterminate' : 'determinate'}
          value={pct}
          color={erro ? 'error' : 'secondary'}
          sx={{ height: 6, borderRadius: 1, mb: 1 }}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {job.processados}/{job.total} analisadas
          </Typography>
          <Chip
            size="small"
            variant="outlined"
            color="success"
            label={`${job.resolvidos} conciliada(s)`}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
