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
import { useCreateCostCenterMutation, useUpdateCostCenterMutation } from '../hooks';
import type { CostCenterResponse } from '../types';
import { ClientScopeSelect } from './ClientScopeSelect';

interface Props {
  open: boolean;
  costCenter: CostCenterResponse | null;
  onClose: () => void;
}

export function CostCenterFormDialog({ open, costCenter, onClose }: Props) {
  const isEdit = !!costCenter;
  const create = useCreateCostCenterMutation();
  const update = useUpdateCostCenterMutation();

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCodigo(costCenter?.codigo ?? '');
      setNome(costCenter?.nome ?? '');
      setAtivo(costCenter?.ativo ?? true);
      setClienteId(costCenter?.clienteId ?? null);
    }
  }, [open, costCenter]);

  const pending = create.isPending || update.isPending;
  const valid = codigo.trim().length > 0 && nome.trim().length > 0;

  const onSubmit = async () => {
    if (!valid) return;
    const body = { codigo: codigo.trim(), nome: nome.trim(), ativo, clienteId };
    if (isEdit && costCenter) {
      await update.mutateAsync({ id: costCenter.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar centro de custo' : 'Novo centro de custo'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Código" fullWidth value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <TextField label="Nome" fullWidth value={nome} onChange={(e) => setNome(e.target.value)} />
          <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          <FormControlLabel
            control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
            label="Ativo"
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
