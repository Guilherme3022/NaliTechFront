import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useExportLayoutMutation } from '../hooks';

// Modal de configuração antes de exportar (E10.2): período.
export function ExportConfigModal({
  sistema,
  onClose,
}: {
  sistema: string | null;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const firstDay = today.slice(0, 8) + '01';
  const [inicio, setInicio] = useState(firstDay);
  const [fim, setFim] = useState(today);
  const exportMutation = useExportLayoutMutation();

  return (
    <Dialog open={!!sistema} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Exportar — {sistema}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Início"
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Fim"
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={exportMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={exportMutation.isPending}
          onClick={async () => {
            if (sistema) {
              await exportMutation.mutateAsync({ sistema, inicio, fim });
              onClose();
            }
          }}
        >
          {exportMutation.isPending ? 'Gerando...' : 'Gerar e baixar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
