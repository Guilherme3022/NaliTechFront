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

// Revisão manual (E8.3): quando não há sugestão, o usuário escolhe a conta
// contábil e confirma manualmente a conciliação.
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
      <DialogTitle>Conciliação manual</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {item?.motivo && <Alert severity="info">{item.motivo}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Movimentação {item?.movementId.slice(0, 8)} — selecione a conta contábil para conciliar.
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
