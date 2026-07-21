import { useEffect, useMemo, useState } from 'react';
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
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMovementsQuery } from '@/modules/movements/hooks';
import type { MovementResponse } from '@/modules/movements/types';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { useGroupMatchMutation } from '../hooks';
import type { ReconciliationResponse } from '../types';

// Vincular ao sistema (1:1 ou N:1): casa o lançamento do extrato com um ou mais
// lançamentos do sistema cuja soma bata com o valor do extrato. A busca é feita no
// servidor (por descrição/CNPJ/valor); a seleção guarda os lançamentos escolhidos, então
// a soma continua correta mesmo trocando a busca.
export function GroupMatchModal({
  item,
  onClose,
}: {
  item: ReconciliationResponse | null;
  onClose: () => void;
}) {
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  // Seleção guarda o objeto inteiro (não só o id) para somar mesmo o que sumiu da busca.
  const [selecionadas, setSelecionadas] = useState<Map<string, MovementResponse>>(new Map());
  const group = useGroupMatchMutation();

  // Debounce da busca (evita uma requisição por tecla).
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca.trim()), 300);
    return () => clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    if (item) {
      setSelecionadas(new Map());
      setBusca('');
      setBuscaDebounced('');
    }
  }, [item]);

  const query = useMovementsQuery({
    page: 0,
    size: 50,
    clienteId,
    competencia,
    q: buscaDebounced || undefined,
  });

  const alvo = Math.abs(item?.movimento?.valor ?? 0);

  // Resultados da busca, exceto a própria movimentação do extrato.
  const resultados = useMemo(
    () => (query.data?.content ?? []).filter((m) => m.id !== item?.movementId),
    [query.data, item],
  );

  const soma = useMemo(
    () => [...selecionadas.values()].reduce((acc, m) => acc + Math.abs(m.valor ?? 0), 0),
    [selecionadas],
  );

  const diff = Math.abs(alvo - soma);
  const confere = diff < 0.01 && selecionadas.size > 0;

  const toggle = (m: MovementResponse) =>
    setSelecionadas((prev) => {
      const next = new Map(prev);
      if (next.has(m.id)) next.delete(m.id);
      else next.set(m.id, m);
      return next;
    });

  const onConfirm = async () => {
    if (!item || !confere) return;
    await group.mutateAsync({ id: item.id, movementIds: [...selecionadas.keys()] });
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
              label={`Selecionado: ${formatCurrency(soma)} (${selecionadas.size})`}
            />
            {selecionadas.size > 0 && !confere && (
              <Chip color="error" variant="outlined" label={`Diferença: ${formatCurrency(diff)}`} />
            )}
          </Stack>

          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por descrição, CNPJ/documento ou valor…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {query.isError && <Alert severity="error">Falha ao carregar movimentações.</Alert>}

          <TableContainer sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>CNPJ/Doc</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((m) => (
                  <TableRow key={m.id} hover selected={selecionadas.has(m.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selecionadas.has(m.id)} onChange={() => toggle(m)} />
                    </TableCell>
                    <TableCell>{formatDate(m.data)}</TableCell>
                    <TableCell>{m.descricao ?? '—'}</TableCell>
                    <TableCell>{m.documento ?? '—'}</TableCell>
                    <TableCell align="right">{formatCurrency(m.valor)}</TableCell>
                  </TableRow>
                ))}
                {resultados.length === 0 && !query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {buscaDebounced
                            ? 'Nenhum resultado para a busca.'
                            : 'Nenhuma movimentação disponível para vincular nesta competência.'}
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
          Vincular {selecionadas.size > 0 ? `(${selecionadas.size})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
