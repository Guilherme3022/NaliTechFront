import { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatDateTime } from '@/shared/lib/format';
import { useAuditLogsQuery } from '../hooks';
import type { AuditLog } from '../types';

function prettyJson(raw: string | null): string {
  if (!raw) return '—';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function DetailRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton size="small" onClick={() => setOpen((o) => !o)}>
        {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </IconButton>
      <Collapse in={open} unmountOnExit>
        <Box
          component="pre"
          sx={{
            mt: 1,
            p: 1.5,
            bgcolor: '#0d1117',
            color: '#c9d1d9',
            borderRadius: 1,
            fontSize: 12,
            overflow: 'auto',
            maxWidth: 480,
          }}
        >
          {prettyJson(log.detalhes)}
        </Box>
      </Collapse>
    </>
  );
}

export function AuditPage() {
  const { page, size, setPage, setSize } = usePagination(20, 'timestamp,desc');
  const [entidade, setEntidade] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  const query = useAuditLogsQuery({
    page,
    size,
    sort: 'timestamp,desc',
    entidade: entidade || undefined,
    usuarioId: usuarioId || undefined,
    inicio: inicio ? `${inicio}T00:00:00Z` : undefined,
    fim: fim ? `${fim}T23:59:59Z` : undefined,
  });

  const columns: Column<AuditLog>[] = [
    { key: 'timestamp', label: 'Data', render: (l) => formatDateTime(l.timestamp) },
    { key: 'acao', label: 'Ação', render: (l) => <Chip size="small" label={l.acao} variant="outlined" /> },
    { key: 'entidade', label: 'Entidade' },
    { key: 'entidadeId', label: 'ID', render: (l) => l.entidadeId?.slice(0, 8) ?? '—' },
    { key: 'usuarioId', label: 'Usuário', render: (l) => l.usuarioId?.slice(0, 8) ?? '—' },
    { key: 'ip', label: 'IP', render: (l) => l.ip ?? '—' },
    { key: 'detalhes', label: 'Payload', render: (l) => <DetailRow log={l} /> },
  ];

  return (
    <>
      <PageHeader title="Auditoria" subtitle="Trilha de eventos do sistema" />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
          <TextField
            label="Entidade"
            size="small"
            value={entidade}
            onChange={(e) => {
              setEntidade(e.target.value);
              setPage(0);
            }}
          />
          <TextField
            label="ID do usuário"
            size="small"
            value={usuarioId}
            onChange={(e) => {
              setUsuarioId(e.target.value);
              setPage(0);
            }}
          />
          <TextField
            label="Início"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={inicio}
            onChange={(e) => {
              setInicio(e.target.value);
              setPage(0);
            }}
          />
          <TextField
            label="Fim"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fim}
            onChange={(e) => {
              setFim(e.target.value);
              setPage(0);
            }}
          />
        </Stack>
      </Paper>

      <DataTable
        columns={columns}
        rows={query.data?.content ?? []}
        rowKey={(l) => l.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhum log encontrado para os filtros."
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
    </>
  );
}
