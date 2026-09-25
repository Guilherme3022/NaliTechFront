import { useState } from 'react';
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { usePagination } from '@/shared/hooks/usePagination';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import { MovementEditDialog } from '../components/MovementEditDialog';
import { useMovementsQuery, useDeleteMovementMutation } from '../hooks';
import type { MovementResponse } from '../types';

const STATUS_COLOR: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  NORMALIZADO: 'default',
  CONCILIACAO_PENDENTE: 'warning',
  CONCILIADO: 'success',
  CLASSIFICADO: 'info',
};

export function MovementsPage() {
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const { page, size, setPage } = usePagination(20);
  const query = useMovementsQuery({ page, size, clienteId, competencia });
  const del = useDeleteMovementMutation();
  const [editing, setEditing] = useState<MovementResponse | null>(null);

  if (!clienteId) {
    return (
      <>
        <PageHeader title="Movimentações" subtitle="Lançamentos extraídos dos arquivos" />
        <EmptyState title="Selecione um cliente" description="Escolha um cliente no topo para ver as movimentações." />
      </>
    );
  }

  const rows = query.data?.content ?? [];

  return (
    <>
      <PageHeader title="Movimentações" subtitle="Lançamentos extraídos dos arquivos" />

      {query.isLoading ? (
        <LoadingState rows={6} />
      ) : query.isError ? (
        <ErrorState onRetry={query.refetch} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhuma movimentação" description="Envie um arquivo na conciliação para gerar movimentações." />
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.data ?? '—'}</TableCell>
                  <TableCell>{m.descricao ?? '—'}</TableCell>
                  <TableCell align="right">
                    {m.valor != null ? m.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
                  </TableCell>
                  <TableCell>{m.documento ?? '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={m.status} color={STATUS_COLOR[m.status] ?? 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditing(m)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => del.mutate(m.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {query.data && query.data.totalPages > 1 && (
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button disabled={query.data.last} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </Stack>
          )}
        </>
      )}

      <MovementEditDialog movement={editing} onClose={() => setEditing(null)} />
    </>
  );
}
