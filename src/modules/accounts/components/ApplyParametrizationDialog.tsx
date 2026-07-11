import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
} from '@mui/material';
import { useApplyParametrizationMutation } from '../hooks';
import type { ParametrizationRequest } from '../types';
import { AccountSelect } from './AccountSelect';

interface Props {
  open: boolean;
  request: ParametrizationRequest | null;
  onClose: () => void;
}

/** Aplica um De/Para em lote para um padrão pendente de parametrização. */
export function ApplyParametrizationDialog({ open, request, onClose }: Props) {
  const apply = useApplyParametrizationMutation();
  const [contaId, setContaId] = useState<string | null>(null);
  const [criarRegra, setCriarRegra] = useState(true);

  useEffect(() => {
    if (open) {
      setContaId(null);
      setCriarRegra(true);
    }
  }, [open]);

  const onSubmit = async () => {
    if (!request || !contaId) return;
    await apply.mutateAsync({
      descricaoContains: request.descricaoPadrao,
      contaId,
      criarRegra,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Parametrizar De/Para</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Todas as {request?.ocorrencias ?? 0} movimentação(ões) conciliadas com a descrição{' '}
            <strong>“{request?.descricaoPadrao}”</strong> serão vinculadas à conta escolhida.
          </Alert>
          <AccountSelect
            label="Conta contábil (contrapartida)"
            value={contaId}
            onChange={setContaId}
            size="medium"
          />
          <FormControlLabel
            control={<Switch checked={criarRegra} onChange={(e) => setCriarRegra(e.target.checked)} />}
            label="Criar regra permanente (classifica os próximos arquivos automaticamente)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={apply.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={apply.isPending || !contaId}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
