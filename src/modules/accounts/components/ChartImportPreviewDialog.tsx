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
  IconButton,
  MenuItem,
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
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
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

// Cópia editável de uma conta lida do arquivo. Guardamos os valores originais para
// detectar edições e recalcular a situação (nova / editada / já existe / sem código).
interface Row {
  // Identificador único (código reduzido quando o plano tem reduzido + classificação).
  codigo: string;
  // Código de classificação (máscara hierárquica) — pode repetir entre contas.
  codigoClassificacao: string | null;
  // Código original COMPLETO, como veio no arquivo (ex.: '000519821301001').
  codigoCompleto: string | null;
  nome: string;
  tipo: string | null;
  natureza: string | null;
  analitica: boolean | null;
  naturezaSaldo: string | null;
  portador: boolean;
  jaExiste: boolean;
  removida: boolean;
  // Valor do código ANTES de qualquer edição do usuário (para detectar linha editada).
  codigoAntesEdicao: string;
  nomeOriginal: string;
}

type NaturezaKey = 'A' | 'S' | 'auto';
type SaldoKey = 'DEVEDORA' | 'CREDORA' | 'none';

function naturezaKey(analitica: boolean | null): NaturezaKey {
  return analitica === true ? 'A' : analitica === false ? 'S' : 'auto';
}

function saldoKey(v: string | null): SaldoKey {
  return v === 'DEVEDORA' || v === 'CREDORA' ? v : 'none';
}

// Importável = tem código e nome, não foi removida e não é uma conta já existente (a menos
// que o código tenha sido editado). O backend ainda revalida duplicidade ao confirmar.
function importavelDe(r: Row): boolean {
  return (
    !r.removida &&
    !!r.codigo.trim() &&
    !!r.nome.trim() &&
    !(r.jaExiste && r.codigo === r.codigoAntesEdicao)
  );
}

function situacaoDe(r: Row): { label: string; color: string } {
  if (!r.codigo.trim() || !r.nome.trim()) return { label: 'Sem código', color: 'text.disabled' };
  if (r.jaExiste && r.codigo === r.codigoAntesEdicao) return { label: 'Já existe', color: 'warning.main' };
  if (r.codigo !== r.codigoAntesEdicao || r.nome !== r.nomeOriginal)
    return { label: 'Editada', color: 'info.main' };
  return { label: 'Nova', color: 'success.main' };
}

/**
 * Mostra o plano de contas lido do arquivo com um checkbox por linha e permite EDITAR
 * (código, nome e natureza) antes de gerar — o próprio usuário corrige um nome errado
 * sem precisar reimportar. Uma segunda aba mostra o conteúdo bruto do arquivo.
 */
export function ChartImportPreviewDialog({ open, clienteId, items, file, onClose }: Props) {
  const confirm = useConfirmImportChartMutation();
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState('');
  const [aba, setAba] = useState(0);
  const [docText, setDocText] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<{
    codigo: string;
    nome: string;
    natureza: NaturezaKey;
    saldo: SaldoKey;
  }>({ codigo: '', nome: '', natureza: 'auto', saldo: 'none' });

  // Conteúdo bruto do arquivo (com fallback de encoding) para a aba "Documento".
  useEffect(() => {
    if (open && file) {
      decodeFileText(file)
        .then(setDocText)
        .catch(() => setDocText('(não foi possível ler o arquivo)'));
    } else if (!open) {
      setDocText('');
    }
  }, [open, file]);

  // Ao abrir/receber novos itens: cria as cópias editáveis e pré-seleciona os importáveis.
  useEffect(() => {
    if (open) {
      setAba(0);
      setEditingIdx(null);
      const initRows: Row[] = items.map((it) => ({
        codigo: it.codigo,
        codigoClassificacao: it.codigoClassificacao,
        codigoCompleto: it.codigoOriginal,
        nome: it.nome,
        tipo: it.tipo,
        natureza: it.natureza,
        analitica: it.analitica,
        naturezaSaldo: it.naturezaSaldo,
        portador: it.portador,
        jaExiste: it.jaExiste,
        removida: false,
        codigoAntesEdicao: it.codigo,
        nomeOriginal: it.nome,
      }));
      setRows(initRows);
      const init = new Set<number>();
      initRows.forEach((r, i) => {
        if (importavelDe(r)) init.add(i);
      });
      setSelected(init);
      setFiltro('');
    }
  }, [open, items]);

  const importaveisIdx = useMemo(
    () => rows.map((r, i) => ({ r, i })).filter(({ r }) => importavelDe(r)).map(({ i }) => i),
    [rows],
  );

  const visiveis = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    const base = rows.map((r, i) => ({ r, i })).filter(({ r }) => !r.removida);
    if (!termo) return base;
    return base.filter(
      ({ r }) => r.nome.toLowerCase().includes(termo) || r.codigo.toLowerCase().includes(termo),
    );
  }, [rows, filtro]);

  const totalImportaveis = importaveisIdx.length;
  const totalSelecionados = importaveisIdx.filter((i) => selected.has(i)).length;
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
    setSelected(allSelected ? new Set() : new Set(importaveisIdx));
  };

  const startEdit = (i: number) => {
    setEditingIdx(i);
    setDraft({
      codigo: rows[i].codigo,
      nome: rows[i].nome,
      natureza: naturezaKey(rows[i].analitica),
      saldo: saldoKey(rows[i].naturezaSaldo),
    });
  };

  const saveEdit = (i: number) => {
    const analitica = draft.natureza === 'A' ? true : draft.natureza === 'S' ? false : null;
    const label = analitica === true ? 'ANALITICA' : analitica === false ? 'SINTETICA' : null;
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i
          ? {
              ...r,
              codigo: draft.codigo.trim(),
              nome: draft.nome.trim(),
              analitica,
              natureza: label ?? r.natureza,
              tipo: label ?? r.tipo,
              naturezaSaldo: draft.saldo === 'none' ? null : draft.saldo,
            }
          : r,
      ),
    );
    setEditingIdx(null);
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, removida: true } : r)));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(i);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!clienteId) return;
    const contas = importaveisIdx
      .filter((i) => selected.has(i))
      .map((i) => {
        const r = rows[i];
        return {
          codigo: r.codigo,
          // Preserva classificação e código completo de ponta a ponta (agrupamento/relatórios).
          codigoClassificacao: r.codigoClassificacao,
          codigoOriginal: r.codigoCompleto,
          nome: r.nome,
          tipo: r.tipo ?? r.natureza,
          analitica: r.analitica,
          naturezaSaldo: r.naturezaSaldo,
        };
      });
    if (contas.length === 0) return;
    await confirm.mutateAsync({ clienteId, contas });
    onClose();
  };

  const jaExistem = rows.filter((r) => r.jaExiste && r.codigo === r.codigoAntesEdicao).length;
  const semCodigo = rows.filter((r) => !r.codigo.trim() || !r.nome.trim()).length;

  // Tipo = S (Sintética) / A (Analítica). Natureza = D (Devedora) / C (Credora). Ambos opcionais.
  const tipoChip = (r: Row) =>
    r.analitica === true ? (
      <Tooltip title="Analítica">
        <Chip size="small" color="success" variant="outlined" label="A" />
      </Tooltip>
    ) : r.analitica === false ? (
      <Tooltip title="Sintética">
        <Chip size="small" variant="outlined" label="S" />
      </Tooltip>
    ) : (
      <>—</>
    );

  const naturezaChip = (r: Row) =>
    r.naturezaSaldo === 'DEVEDORA' ? (
      <Tooltip title="Devedora (débito)">
        <Chip size="small" color="error" variant="outlined" label="D" />
      </Tooltip>
    ) : r.naturezaSaldo === 'CREDORA' ? (
      <Tooltip title="Credora (crédito)">
        <Chip size="small" color="success" variant="outlined" label="C" />
      </Tooltip>
    ) : (
      <>—</>
    );

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
              {rows.length} conta(s) lida(s). Marque as que deseja gerar e, se precisar, clique no
              lápis para corrigir código, nome ou natureza antes de importar.
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
                    <TableCell>Tipo</TableCell>
                    <TableCell>Natureza</TableCell>
                    <TableCell>Situação</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visiveis.map(({ r, i }) => {
                    const editando = editingIdx === i;
                    const importavel = importavelDe(r);
                    const sit = situacaoDe(r);
                    return (
                      <TableRow key={i} hover selected={selected.has(i)}>
                        <TableCell padding="checkbox">
                          <Tooltip title={importavel ? '' : 'Sem código/nome ou já existente'}>
                            <span>
                              <Checkbox
                                checked={selected.has(i)}
                                onChange={() => toggle(i)}
                                disabled={!importavel || editando}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>

                        {editando ? (
                          <>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="standard"
                                value={draft.codigo}
                                onChange={(e) => setDraft((d) => ({ ...d, codigo: e.target.value }))}
                                sx={{ width: 120 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="standard"
                                fullWidth
                                value={draft.nome}
                                onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="standard"
                                select
                                value={draft.natureza}
                                onChange={(e) =>
                                  setDraft((d) => ({ ...d, natureza: e.target.value as NaturezaKey }))
                                }
                                sx={{ minWidth: 110 }}
                              >
                                <MenuItem value="auto">Automática</MenuItem>
                                <MenuItem value="A">Analítica</MenuItem>
                                <MenuItem value="S">Sintética</MenuItem>
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                variant="standard"
                                select
                                value={draft.saldo}
                                onChange={(e) =>
                                  setDraft((d) => ({ ...d, saldo: e.target.value as SaldoKey }))
                                }
                                sx={{ minWidth: 100 }}
                              >
                                <MenuItem value="none">—</MenuItem>
                                <MenuItem value="DEVEDORA">Devedora (débito)</MenuItem>
                                <MenuItem value="CREDORA">Credora (crédito)</MenuItem>
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                editando…
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Salvar">
                                <IconButton size="small" color="primary" onClick={() => saveEdit(i)}>
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancelar">
                                <IconButton size="small" onClick={() => setEditingIdx(null)}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              {r.codigo || '—'}
                              {r.codigoCompleto && r.codigoCompleto !== r.codigo && (
                                <Tooltip title="Código completo (reduzido + classificação) como veio no arquivo">
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ fontFamily: 'monospace' }}
                                  >
                                    {r.codigoCompleto}
                                  </Typography>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>
                              {r.nome || '—'}
                              {r.portador && (
                                <Chip size="small" label="Portador" sx={{ ml: 1 }} variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>{tipoChip(r)}</TableCell>
                            <TableCell>{naturezaChip(r)}</TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ color: sit.color }}>
                                {sit.label}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => startEdit(i)}
                                  disabled={editingIdx !== null}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir da importação">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeRow(i)}
                                  disabled={editingIdx !== null}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                  {visiveis.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
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
          disabled={confirm.isPending || totalSelecionados === 0 || editingIdx !== null}
        >
          Gerar {totalSelecionados} conta(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
