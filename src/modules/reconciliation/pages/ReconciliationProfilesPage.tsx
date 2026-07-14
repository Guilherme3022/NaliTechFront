import { useState, type ChangeEvent } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { useActiveClient } from '@/shared/lib/activeSelection';
import {
  useCreateProfileMutation,
  useDeleteProfileMutation,
  useProfilesQuery,
} from '../hooks';

export function ReconciliationProfilesPage() {
  const clienteId = useActiveClient() ?? undefined;
  const query = useProfilesQuery(clienteId);
  const create = useCreateProfileMutation();
  const del = useDeleteProfileMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    sistemaOrigem: '',
    tipoArquivo: '',
    sistemaContabilDestino: '',
  });

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const salvar = () => {
    if (!clienteId) return;
    create.mutate(
      {
        clienteId,
        nome: form.nome,
        sistemaOrigem: form.sistemaOrigem || undefined,
        tipoArquivo: form.tipoArquivo || undefined,
        sistemaContabilDestino: form.sistemaContabilDestino || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ nome: '', sistemaOrigem: '', tipoArquivo: '', sistemaContabilDestino: '' });
        },
      },
    );
  };

  return (
    <>
      <PageHeader title="Perfis de conciliação" subtitle="Configuração de processamento por cliente" />

      {!clienteId ? (
        <EmptyState title="Selecione um cliente" description="Escolha um cliente no topo para ver e criar perfis." />
      ) : (
        <>
          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Novo perfil
            </Button>
          </Box>

          {query.isLoading ? (
            <LoadingState rows={3} />
          ) : query.isError ? (
            <ErrorState onRetry={query.refetch} />
          ) : (query.data ?? []).length === 0 ? (
            <EmptyState title="Nenhum perfil" description="Crie um perfil de conciliação para este cliente." />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Origem</TableCell>
                  <TableCell>Tipo de arquivo</TableCell>
                  <TableCell>Destino contábil</TableCell>
                  <TableCell>Situação</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {(query.data ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nome}</TableCell>
                    <TableCell>{p.sistemaOrigem ?? '—'}</TableCell>
                    <TableCell>{p.tipoArquivo ?? '—'}</TableCell>
                    <TableCell>{p.sistemaContabilDestino ?? '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={p.ativo ? 'Ativo' : 'Inativo'} color={p.ativo ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="error" size="small" onClick={() => del.mutate(p.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo perfil de conciliação</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={form.nome} onChange={set('nome')} autoFocus />
            <TextField label="Sistema de origem" value={form.sistemaOrigem} onChange={set('sistemaOrigem')} />
            <TextField label="Tipo de arquivo" value={form.tipoArquivo} onChange={set('tipoArquivo')} />
            <TextField
              label="Sistema contábil de destino"
              value={form.sistemaContabilDestino}
              onChange={set('sistemaContabilDestino')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!form.nome || create.isPending} onClick={salvar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
