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
import { useCreateBankAccountMutation, useUpdateBankAccountMutation } from '../hooks';
import type { BankAccountResponse } from '../types';
import { AccountSelect } from './AccountSelect';
import { ClientScopeSelect } from './ClientScopeSelect';

interface Props {
  open: boolean;
  account: BankAccountResponse | null;
  onClose: () => void;
}

export function BankAccountFormDialog({ open, account, onClose }: Props) {
  const isEdit = !!account;
  const create = useCreateBankAccountMutation();
  const update = useUpdateBankAccountMutation();

  const [nome, setNome] = useState('');
  const [contaContabilId, setContaContabilId] = useState<string | null>(null);
  const [padrao, setPadrao] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNome(account?.nome ?? '');
      setContaContabilId(account?.contaContabilId ?? null);
      setPadrao(account?.padrao ?? false);
      setClienteId(account?.clienteId ?? null);
    }
  }, [open, account]);

  const pending = create.isPending || update.isPending;
  const valid = nome.trim().length > 0 && !!contaContabilId;

  const onSubmit = async () => {
    if (!valid || !contaContabilId) return;
    const body = { nome: nome.trim(), contaContabilId, padrao, clienteId };
    if (isEdit && account) {
      await update.mutateAsync({ id: account.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar conta bancária' : 'Nova conta bancária'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome (ex: Banco do Brasil c/c)"
            fullWidth
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <AccountSelect
            label="Conta contábil do banco"
            value={contaContabilId}
            onChange={setContaContabilId}
            size="medium"
          />
          <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          <FormControlLabel
            control={<Switch checked={padrao} onChange={(e) => setPadrao(e.target.checked)} />}
            label="Usar como banco padrão"
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
