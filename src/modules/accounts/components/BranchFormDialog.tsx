import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useCreateBranchMutation, useUpdateBranchMutation } from '../hooks';
import type { BranchResponse } from '../types';
import { ClientScopeSelect } from './ClientScopeSelect';

interface Props {
  open: boolean;
  branch: BranchResponse | null;
  onClose: () => void;
}

export function BranchFormDialog({ open, branch, onClose }: Props) {
  const isEdit = !!branch;
  const create = useCreateBranchMutation();
  const update = useUpdateBranchMutation();

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCodigo(branch?.codigo ?? '');
      setNome(branch?.nome ?? '');
      setCnpj(branch?.cnpj ?? '');
      setAtivo(branch?.ativo ?? true);
      setClienteId(branch?.clienteId ?? null);
    }
  }, [open, branch]);

  const pending = create.isPending || update.isPending;
  const valid = codigo.trim().length > 0 && nome.trim().length > 0;

  const onSubmit = async () => {
    if (!valid) return;
    const body = {
      codigo: codigo.trim(),
      nome: nome.trim(),
      cnpj: cnpj.trim() || null,
      ativo,
      clienteId,
    };
    if (isEdit && branch) {
      await update.mutateAsync({ id: branch.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar filial' : 'Nova filial'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Código" fullWidth value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <TextField label="Nome" fullWidth value={nome} onChange={(e) => setNome(e.target.value)} />
          <TextField label="CNPJ (opcional)" fullWidth value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          <FormControlLabel
            control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
            label="Ativa"
          />
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
