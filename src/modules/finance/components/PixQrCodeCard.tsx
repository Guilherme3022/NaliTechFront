import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QRCodeSVG } from 'qrcode.react';
import { notifySuccess } from '@/shared/lib/notify';

// Mostra o QR code do PIX e o código copia-e-cola (E12.3).
export function PixQrCodeCard({ pixCopiaCola }: { pixCopiaCola: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(pixCopiaCola);
    notifySuccess('Código PIX copiado.');
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Pagar com PIX
        </Typography>
        <Stack alignItems="center" spacing={2}>
          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 1 }}>
            <QRCodeSVG value={pixCopiaCola} size={180} />
          </Box>
          <TextField value={pixCopiaCola} fullWidth size="small" InputProps={{ readOnly: true }} />
          <Button startIcon={<ContentCopyIcon />} onClick={copy} variant="outlined" fullWidth>
            Copiar código copia-e-cola
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
