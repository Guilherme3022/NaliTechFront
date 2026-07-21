import { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMovementsQuery } from '@/modules/movements/hooks';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { useGroupMatchMutation } from '../hooks';
import type { ReconciliationResponse } from '../types';

// Pareamento N:1: casa o lançamento do extrato (item) com várias movimentações do
// sistema cuja soma bata com o valor do extrato (ex.: um depósito que quita várias
// duplicatas). Mostra a soma corrente x o alvo e só habilita quando confere.
export function GroupMatchModal({
  item,
  onClose,
}: {
  item: ReconciliationResponse | null;
  onClose: () => void;
}) {
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const query = useMovementsQuery({ page: 0, size: 200, clienteId, competencia });
  const group = useGroupMatchMutation();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (item) setSelected(new Set());
  }, [item]);

  const alvo = Math.abs(item?.movimento?.valor ?? 0);

  // Candidatas: movimentações do cliente na competência, exceto a própria do extrato.
  const candidatas = useMemo(
    () => (query.data?.content ?? []).filter((m) => m.id !== item?.movementId),
    [query.data, item],
  );

  const soma = useMemo(
    () =>
      candidatas
        .filter((m) => selected.has(m.id))
        .reduce((acc, m) => acc + Math.abs(m.valor ?? 0), 0),
    [candidatas, selected],
  );

  const diff = Math.abs(alvo - soma);
  const confere = diff < 0.01 && selected.size > 0;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onConfirm = async () => {
    if (!item || !confere) return;
    await group.mutateAsync({ id: item.id, movementIds: [...selected] });
    onClose();
  };

  return (
    <Dialog open={!!item} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Vincular ao lançamento do sistema</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Selecione no contas a pagar/receber o(s) lançamento(s) que correspondem a esta linha do
            extrato. Pode ser <b>um</b> (1:1) ou <b>vários que somados</b> batem com o valor (ex.: um
            depósito único que quita várias duplicatas). O botão libera quando a soma confere.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip color="default" variant="outlined" label={`Extrato (alvo): ${formatCurrency(alvo)}`} />
            <Chip
              color={confere ? 'success' : 'warning'}
              variant="outlined"
              label={`Selecionado: ${formatCurrency(soma)}`}
            />
            {selected.size > 0 && !confere && (
              <Chip color="error" variant="outlined" label={`Diferença: ${formatCurrency(diff)}`} />
            )}
          </Stack>

          {query.isError && <Alert severity="error">Falha ao carregar movimentações.</Alert>}

          <TableContainer sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidatas.map((m) => (
                  <TableRow key={m.id} hover selected={selected.has(m.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.has(m.id)} onChange={() => toggle(m.id)} />
                    </TableCell>
                    <TableCell>{formatDate(m.data)}</TableCell>
                    <TableCell>{m.descricao ?? '—'}</TableCell>
                    <TableCell align="right">{formatCurrency(m.valor)}</TableCell>
                  </TableRow>
                ))}
                {candidatas.length === 0 && !query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma movimentação disponível para agrupar nesta competência.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={group.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={!confere || group.isPending}>
          Agrupar {selected.size > 0 ? `(${selected.size})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
