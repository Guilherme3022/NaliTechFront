import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { notifySuccess } from '@/shared/lib/notify';
import type { CreatedApiKeyResponse } from '../types';

// E17.4 — exibe a chave gerada UMA ÚNICA VEZ, com aviso.
export function ApiKeyCreatedModal({
  created,
  onClose,
}: {
  created: CreatedApiKeyResponse | null;
  onClose: () => void;
}) {
  const copy = async () => {
    if (created) {
      await navigator.clipboard.writeText(created.chave);
      notifySuccess('Chave copiada.');
    }
  };

  return (
    <Dialog open={!!created} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chave de API criada</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            Copie a chave agora. Por segurança, ela <strong>não será exibida novamente</strong>.
          </Alert>
          <TextField label="Nome" value={created?.nome ?? ''} fullWidth InputProps={{ readOnly: true }} />
          <TextField
            label="Chave"
            value={created?.chave ?? ''}
            fullWidth
            InputProps={{ readOnly: true }}
            multiline
          />
          <Button startIcon={<ContentCopyIcon />} variant="outlined" onClick={copy}>
            Copiar chave
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Já copiei, fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
