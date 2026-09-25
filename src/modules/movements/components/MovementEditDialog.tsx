import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useUpdateMovementMutation } from '../hooks';
import type { MovementType } from '../types';

// Movimentacao editavel (campos comuns entre MovementResponse e a MovementView da conciliacao).
export interface EditableMovement {
  id: string;
  data: string | null;
  valor: number | null;
  descricao: string | null;
  documento: string | null;
  tipo: MovementType | null | string;
}

interface Props {
  movement: EditableMovement | null;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Edicao de movimentacao SEM contas contabeis (debito/credito sao escolhidos na tela de
 * conciliacao). Permite corrigir data/valor/descricao/documento e a natureza (entrada/saida).
 */
export function MovementEditDialog({ movement, onClose, onSaved }: Props) {
  const update = useUpdateMovementMutation();
  const [form, setForm] = useState<EditableMovement | null>(movement);

  if (movement && (!form || form.id !== movement.id)) {
    setForm(movement);
  }
  if (!movement || !form) return null;

  const salvar = () => {
    update.mutate(
      {
        id: movement.id,
        body: {
          data: form.data,
          valor: form.valor,
          descricao: form.descricao,
          documento: form.documento,
          tipo: (form.tipo as MovementType) || null,
        },
      },
      {
        onSuccess: () => {
          onSaved?.();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={!!movement} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar movimentação</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Data"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.data ?? ''}
            onChange={(e) => setForm({ ...form, data: e.target.value || null })}
          />
          <TextField
            label="Valor"
            type="number"
            value={form.valor ?? ''}
            onChange={(e) => setForm({ ...form, valor: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <FormControl fullWidth>
            <InputLabel id="tipo-mov">Tipo</InputLabel>
            <Select
              labelId="tipo-mov"
              label="Tipo"
              value={form.tipo ?? ''}
              onChange={(e) => setForm({ ...form, tipo: (e.target.value as MovementType) || null })}
            >
              <MenuItem value="ENTRADA">Entrada</MenuItem>
              <MenuItem value="SAIDA">Saída</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Descrição"
            value={form.descricao ?? ''}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <TextField
            label="Documento"
            value={form.documento ?? ''}
            onChange={(e) => setForm({ ...form, documento: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={update.isPending} onClick={salvar}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
