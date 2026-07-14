import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
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
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { ClientSelect } from '@/modules/clients/components/ClientSelect';
import {
  useAddContaMutation,
  useAplicarModeloMutation,
  useCreatePlanoModeloMutation,
  useDeletePlanoModeloMutation,
  usePlanoModelosQuery,
} from '../hooks';
import type { PlanoModeloResponse } from '../types';

export function PlanoModelosPage() {
  const query = usePlanoModelosQuery();
  const create = useCreatePlanoModeloMutation();
  const del = useDeletePlanoModeloMutation();
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const salvarModelo = () => {
    create.mutate({ nome, descricao: descricao || undefined }, {
      onSuccess: () => {
        setNovo(false);
        setNome('');
        setDescricao('');
      },
    });
  };

  return (
    <>
      <PageHeader title="Planos-modelo" subtitle="Estruturas reutilizáveis para aplicar aos clientes" />

      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNovo(true)}>
          Novo modelo
        </Button>
      </Box>

      {query.isLoading ? (
        <LoadingState rows={3} />
      ) : query.isError ? (
        <ErrorState onRetry={query.refetch} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState title="Nenhum modelo" description="Crie um modelo e adicione contas para reutilizar." />
      ) : (
        (query.data ?? []).map((modelo) => (
          <ModeloAccordion key={modelo.id} modelo={modelo} onDelete={() => del.mutate(modelo.id)} />
        ))
      )}

      <Dialog open={novo} onClose={() => setNovo(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo modelo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
            <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNovo(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!nome || create.isPending} onClick={salvarModelo}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ModeloAccordion({ modelo, onDelete }: { modelo: PlanoModeloResponse; onDelete: () => void }) {
  const addConta = useAddContaMutation(modelo.id);
  const aplicar = useAplicarModeloMutation(modelo.id);
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);

  const adicionar = () => {
    addConta.mutate({ codigo, nome, tipo: tipo || undefined }, {
      onSuccess: () => {
        setCodigo('');
        setNome('');
        setTipo('');
      },
    });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
          <Typography fontWeight={600}>{modelo.nome}</Typography>
          <Typography variant="caption" color="text.secondary">
            {modelo.contas.length} conta(s)
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Conta</TableCell>
              <TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modelo.contas.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.codigo}</TableCell>
                <TableCell>{c.nome}</TableCell>
                <TableCell>{c.tipo ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <TextField size="small" label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <TextField size="small" label="Conta" value={nome} onChange={(e) => setNome(e.target.value)} />
          <TextField size="small" label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={!codigo || !nome || addConta.isPending}
            onClick={adicionar}
          >
            Adicionar conta
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mt: 3 }}>
          <Box sx={{ minWidth: 240 }}>
            <ClientSelect value={clienteId} onChange={setClienteId} label="Aplicar ao cliente" />
          </Box>
          <Button
            variant="contained"
            disabled={!clienteId || aplicar.isPending}
            onClick={() => clienteId && aplicar.mutate(clienteId)}
          >
            Aplicar ao cliente
          </Button>
          <Box sx={{ flex: 1 }} />
          <IconButton color="error" onClick={onDelete} title="Remover modelo">
            <DeleteIcon />
          </IconButton>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
