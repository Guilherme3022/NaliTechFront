import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { AccountSelect } from '@/modules/accounts/components/AccountSelect';
import { useConfirmReconciliationMutation } from '../hooks';
import type { ReconciliationResponse } from '../types';

// Classificar direto (sem vínculo com o sistema): usado quando a linha do extrato
// NÃO tem um correspondente em contas a pagar/receber (ex.: tarifa bancária, imposto,
// transferência própria). O contador só escolhe a conta contábil e confirma — o
// lançamento é gerado do mesmo jeito, sem precisar casar com nada.
export function ManualMatchModal({
  item,
  onClose,
}: {
  item: ReconciliationResponse | null;
  onClose: () => void;
}) {
  const [contaId, setContaId] = useState<string | null>(null);
  const confirm = useConfirmReconciliationMutation();

  return (
    <Dialog open={!!item} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Classificar direto (sem vínculo)</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {item?.motivo && <Alert severity="info">{item.motivo}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Use quando esta linha do extrato não tem correspondente no sistema (tarifa, imposto,
            transferência…). Selecione a conta contábil e confirme — o lançamento é gerado assim mesmo.
          </Typography>
          <AccountSelect value={contaId} onChange={setContaId} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={confirm.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!contaId || confirm.isPending}
          onClick={async () => {
            if (item && contaId) {
              await confirm.mutateAsync({ id: item.id, body: { contaSugerida: contaId } });
              onClose();
            }
          }}
        >
          Confirmar conciliação
        </Button>
      </DialogActions>
    </Dialog>
  );
}
