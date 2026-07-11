import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ClientScopeSelect } from '@/modules/accounts/components/ClientScopeSelect';
import { useCreateImportLayoutMutation, usePreviewImportLayoutMutation, useUpdateImportLayoutMutation } from '../hooks';
import type { ImportLayoutResponse, PreviewResponse } from '../types';

interface Props {
  open: boolean;
  layout: ImportLayoutResponse | null;
  onClose: () => void;
}

export function ImportLayoutFormDialog({ open, layout, onClose }: Props) {
  const isEdit = !!layout;
  const create = useCreateImportLayoutMutation();
  const update = useUpdateImportLayoutMutation();
  const preview = usePreviewImportLayoutMutation();

  const [nome, setNome] = useState('');
  const [colData, setColData] = useState('');
  const [colValor, setColValor] = useState('');
  const [colDescricao, setColDescricao] = useState('');
  const [colDocumento, setColDocumento] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [amostra, setAmostra] = useState('');
  const [result, setResult] = useState<PreviewResponse | null>(null);

  useEffect(() => {
    if (open) {
      setNome(layout?.nome ?? '');
      setColData(layout?.colData ?? '');
      setColValor(layout?.colValor ?? '');
      setColDescricao(layout?.colDescricao ?? '');
      setColDocumento(layout?.colDocumento ?? '');
      setAtivo(layout?.ativo ?? true);
      setClienteId(layout?.clienteId ?? null);
      setAmostra('');
      setResult(null);
    }
  }, [open, layout]);

  const pending = create.isPending || update.isPending;
  const valid = nome.trim().length > 0;

  const onPreview = async () => {
    const r = await preview.mutateAsync({
      conteudo: amostra,
      colData: colData || null,
      colValor: colValor || null,
      colDescricao: colDescricao || null,
      colDocumento: colDocumento || null,
    });
    setResult(r);
  };

  const onSubmit = async () => {
    if (!valid) return;
    const body = {
      nome: nome.trim(),
      colData: colData || null,
      colValor: colValor || null,
      colDescricao: colDescricao || null,
      colDocumento: colDocumento || null,
      ativo,
      clienteId,
    };
    if (isEdit && layout) {
      await update.mutateAsync({ id: layout.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Editar layout de importação' : 'Novo layout de importação'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome do layout" fullWidth value={nome} onChange={(e) => setNome(e.target.value)} />
          <Typography variant="body2" color="text.secondary">
            Informe o <strong>nome da coluna</strong> (cabeçalho) do arquivo de origem para cada campo:
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="Coluna → Data" fullWidth value={colData} onChange={(e) => setColData(e.target.value)} />
            <TextField label="Coluna → Valor" fullWidth value={colValor} onChange={(e) => setColValor(e.target.value)} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Coluna → Descrição" fullWidth value={colDescricao} onChange={(e) => setColDescricao(e.target.value)} />
            <TextField label="Coluna → Documento" fullWidth value={colDocumento} onChange={(e) => setColDocumento(e.target.value)} />
          </Stack>
          <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          <FormControlLabel
            control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
            label="Ativo"
          />

          <Divider />
          <Typography variant="subtitle2">Pré-visualizar (cole um CSV de exemplo com cabeçalho)</Typography>
          <TextField
            label="CSV de exemplo"
            fullWidth
            multiline
            minRows={3}
            value={amostra}
            onChange={(e) => setAmostra(e.target.value)}
            placeholder={'Data;Valor;Historico;Doc\n01/02/2026;100,00;TARIFA;123'}
          />
          <Box>
            <Button variant="outlined" onClick={onPreview} disabled={preview.isPending || !amostra.trim()}>
              {preview.isPending ? 'Processando...' : 'Testar mapeamento'}
            </Button>
          </Box>
          {result && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Documento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.linhas.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell>{l.data ?? '—'}</TableCell>
                    <TableCell>{l.valor ?? '—'}</TableCell>
                    <TableCell>{l.descricao ?? '—'}</TableCell>
                    <TableCell>{l.documento ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={pending || !valid}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
