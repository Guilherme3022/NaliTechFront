import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { usePagination } from '@/shared/hooks/usePagination';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import { AccountSelect } from '@/modules/accounts/components/AccountSelect';
import { useMovementsQuery, useUpdateMovementMutation, useDeleteMovementMutation } from '../hooks';
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

      <EditMovementDialog movement={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function EditMovementDialog({ movement, onClose }: { movement: MovementResponse | null; onClose: () => void }) {
  const update = useUpdateMovementMutation();
  const [form, setForm] = useState<MovementResponse | null>(movement);

  // Sincroniza o form quando abre para editar outra linha.
  if (movement && (!form || form.id !== movement.id)) {
    setForm(movement);
  }

  if (!movement || !form) return null;

  const salvar = () => {
    update.mutate(
      {
        id: movement.id,
        body: {
          data: form.data,
          valor: form.valor,
          descricao: form.descricao,
          documento: form.documento,
          contaDebitoId: form.contaDebitoId,
          contaCreditoId: form.contaCreditoId,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={!!movement} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar movimentação</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Data"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.data ?? ''}
            onChange={(e) => setForm({ ...form, data: e.target.value || null })}
          />
          <TextField
            label="Valor"
            type="number"
            value={form.valor ?? ''}
            onChange={(e) => setForm({ ...form, valor: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <TextField
            label="Descrição"
            value={form.descricao ?? ''}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <TextField
            label="Documento"
            value={form.documento ?? ''}
            onChange={(e) => setForm({ ...form, documento: e.target.value })}
          />
          <AccountSelect
            label="Conta de débito"
            value={form.contaDebitoId}
            onChange={(id) => setForm({ ...form, contaDebitoId: id })}
          />
          <AccountSelect
            label="Conta de crédito"
            value={form.contaCreditoId}
            onChange={(id) => setForm({ ...form, contaCreditoId: id })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={update.isPending} onClick={salvar}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
