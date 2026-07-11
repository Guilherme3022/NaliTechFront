import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
} from '@mui/material';
import { useExportLayoutMutation, useExportValidationQuery } from '../hooks';

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
  const validation = useExportValidationQuery(inicio, fim, !!sistema);

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

          {validation.data && validation.data.comProblema > 0 && (
            <Alert severity="warning">
              <AlertTitle>
                {validation.data.comProblema} de {validation.data.total} lançamento(s) com pendência
              </AlertTitle>
              <List dense disablePadding sx={{ maxHeight: 160, overflow: 'auto' }}>
                {validation.data.problemas.slice(0, 10).map((p) => (
                  <ListItem key={p.movementId} disableGutters>
                    <ListItemText primary={p.descricao ?? '—'} secondary={p.motivo} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}
          {validation.data && validation.data.comProblema === 0 && validation.data.total > 0 && (
            <Alert severity="success">
              {validation.data.total} lançamento(s) prontos para exportar.
            </Alert>
          )}
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
