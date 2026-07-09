import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime } from '@/shared/lib/format';
import { useApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation } from '../hooks';
import { ApiKeyCreatedModal } from '../components/ApiKeyCreatedModal';
import type { ApiKeyResponse, CreatedApiKeyResponse } from '../types';

const ESCOPOS = ['READ', 'WRITE', 'READ_WRITE'];

const schema = z.object({
  nome: z.string().min(1, 'Informe um nome'),
  escopos: z.string().min(1, 'Selecione o escopo'),
});
type FormValues = z.infer<typeof schema>;

export function ApiKeysPage() {
  const query = useApiKeysQuery();
  const create = useCreateApiKeyMutation();
  const revoke = useRevokeApiKeyMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [created, setCreated] = useState<CreatedApiKeyResponse | null>(null);
  const [toRevoke, setToRevoke] = useState<ApiKeyResponse | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', escopos: 'READ' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await create.mutateAsync({ nome: values.nome, escopos: values.escopos });
    reset();
    setFormOpen(false);
    setCreated(res); // exibição única da chave
  });

  const columns: Column<ApiKeyResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'escopos', label: 'Escopo', render: (k) => k.escopos ?? '—' },
    { key: 'ultimoUso', label: 'Último uso', render: (k) => (k.ultimoUso ? formatDateTime(k.ultimoUso) : 'Nunca') },
    {
      key: 'ativo',
      label: 'Status',
      render: (k) => (
        <Chip size="small" label={k.ativo ? 'Ativa' : 'Revogada'} color={k.ativo ? 'success' : 'default'} variant="outlined" />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (k) =>
        k.ativo && (
          <Tooltip title="Revogar">
            <IconButton size="small" onClick={() => setToRevoke(k)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Nova chave
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={query.data ?? []}
        rowKey={(k) => k.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhuma chave de API criada. Crie uma para autenticar o n8n ou integrações externas."
      />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nova chave de API</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                fullWidth
                error={!!errors.nome}
                helperText={errors.nome?.message}
                {...register('nome')}
              />
              <Controller
                name="escopos"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Escopo</InputLabel>
                    <Select label="Escopo" {...field}>
                      {ESCOPOS.map((e) => (
                        <MenuItem key={e} value={e}>
                          {e}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)} disabled={create.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              Criar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ApiKeyCreatedModal created={created} onClose={() => setCreated(null)} />

      <ConfirmDialog
        open={!!toRevoke}
        title="Revogar chave"
        message={`Revogar a chave "${toRevoke?.nome}"? Integrações que a usam deixarão de funcionar.`}
        confirmLabel="Revogar"
        confirmColor="error"
        loading={revoke.isPending}
        onClose={() => setToRevoke(null)}
        onConfirm={async () => {
          if (toRevoke) await revoke.mutateAsync(toRevoke.id);
          setToRevoke(null);
        }}
      />
    </>
  );
}
