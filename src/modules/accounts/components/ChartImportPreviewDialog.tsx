import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { decodeFileText } from '@/shared/lib/fileText';
import { useConfirmImportChartMutation } from '../hooks';
import type { ChartImportPreviewItem } from '../types';

interface Props {
  open: boolean;
  clienteId: string | null;
  items: ChartImportPreviewItem[];
  // Arquivo original, para a aba "Documento" (compara o bruto com a leitura do sistema).
  file?: File | null;
  onClose: () => void;
}

/**
 * Mostra o plano de contas lido do arquivo com um checkbox por linha. As contas
 * importáveis vêm marcadas por padrão; o usuário pode desmarcar as que não quer gerar.
 * Contas sem código ou já existentes ficam bloqueadas (não podem ser importadas).
 */
export function ChartImportPreviewDialog({ open, clienteId, items, file, onClose }: Props) {
  const confirm = useConfirmImportChartMutation();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState('');
  const [aba, setAba] = useState(0);
  const [docText, setDocText] = useState('');

  // Carrega o conteúdo bruto do arquivo (com fallback de encoding) para a aba "Documento".
  useEffect(() => {
    if (open && file) {
      decodeFileText(file)
        .then(setDocText)
        .catch(() => setDocText('(não foi possível ler o arquivo)'));
    } else if (!open) {
      setDocText('');
    }
  }, [open, file]);

  // Ao abrir/receber novos itens, pré-seleciona apenas os importáveis.
  useEffect(() => {
    if (open) {
      setAba(0);
      const init = new Set<number>();
      items.forEach((it, i) => {
        if (it.importavel) init.add(i);
      });
      setSelected(init);
      setFiltro('');
    }
  }, [open, items]);

  const importaveis = useMemo(
    () => items.map((it, i) => ({ it, i })).filter(({ it }) => it.importavel),
    [items],
  );

  const visiveis = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    const base = items.map((it, i) => ({ it, i }));
    if (!termo) return base;
    return base.filter(
      ({ it }) =>
        it.nome.toLowerCase().includes(termo) || it.codigo.toLowerCase().includes(termo),
    );
  }, [items, filtro]);

  const totalImportaveis = importaveis.length;
  const totalSelecionados = importaveis.filter(({ i }) => selected.has(i)).length;
  const allSelected = totalImportaveis > 0 && totalSelecionados === totalImportaveis;
  const someSelected = totalSelecionados > 0 && !allSelected;

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(importaveis.map(({ i }) => i)));
    }
  };

  const handleConfirm = async () => {
    if (!clienteId) return;
    const contas = importaveis
      .filter(({ i }) => selected.has(i))
      .map(({ it }) => ({
        codigo: it.codigo,
        nome: it.nome,
        tipo: it.tipo ?? it.natureza,
        analitica: it.analitica,
      }));
    if (contas.length === 0) return;
    await confirm.mutateAsync({ clienteId, contas });
    onClose();
  };

  const jaExistem = items.filter((it) => it.jaExiste).length;
  const semCodigo = items.filter((it) => !it.importavel && !it.jaExiste).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Revisar plano de contas</DialogTitle>
      <DialogContent>
        <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 1.5 }}>
          <Tab label="Importação (sistema)" />
          <Tab label="Documento (arquivo)" />
        </Tabs>
        {aba === 1 && (
          <Box
            sx={{
              maxHeight: 480,
              overflow: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Conteúdo bruto do arquivo — compare com a leitura do sistema na outra aba.
            </Typography>
            <Box
              component="pre"
              sx={{ m: 0, mt: 1, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre' }}
            >
              {docText || 'Carregando…'}
            </Box>
          </Box>
        )}
        {aba === 0 && (
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {items.length} conta(s) lida(s). Marque as que deseja gerar. Contas já existentes ou
            sem código não podem ser importadas.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" color="primary" label={`Selecionadas: ${totalSelecionados}/${totalImportaveis}`} />
            {jaExistem > 0 && <Chip size="small" variant="outlined" label={`Já existem: ${jaExistem}`} />}
            {semCodigo > 0 && <Chip size="small" variant="outlined" label={`Sem código: ${semCodigo}`} />}
          </Stack>
          <TextField
            size="small"
            placeholder="Filtrar por nome ou código…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <TableContainer sx={{ maxHeight: 440, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      disabled={totalImportaveis === 0}
                    />
                  </TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Natureza</TableCell>
                  <TableCell>Situação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visiveis.map(({ it, i }) => (
                  <TableRow key={i} hover selected={selected.has(i)}>
                    <TableCell padding="checkbox">
                      <Tooltip
                        title={
                          it.importavel
                            ? ''
                            : it.jaExiste
                              ? 'Já cadastrada para este cliente'
                              : 'Sem código — não importável'
                        }
                      >
                        <span>
                          <Checkbox
                            checked={selected.has(i)}
                            onChange={() => toggle(i)}
                            disabled={!it.importavel}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{it.codigo || '—'}</TableCell>
                    <TableCell>
                      {it.nome}
                      {it.portador && (
                        <Chip size="small" label="Portador" sx={{ ml: 1 }} variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {it.analitica === true ? (
                        <Chip size="small" color="success" variant="outlined" label="Analítica" />
                      ) : it.analitica === false ? (
                        <Chip size="small" variant="outlined" label="Sintética" />
                      ) : (
                        it.tipo ?? '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {it.jaExiste ? (
                        <Typography variant="caption" color="warning.main">
                          Já existe
                        </Typography>
                      ) : !it.importavel ? (
                        <Typography variant="caption" color="text.disabled">
                          Sem código
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="success.main">
                          Nova
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {visiveis.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma conta encontrada para o filtro.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={confirm.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={confirm.isPending || totalSelecionados === 0}
        >
          Gerar {totalSelecionados} conta(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
