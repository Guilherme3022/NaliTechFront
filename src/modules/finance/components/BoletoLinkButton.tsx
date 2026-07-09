import { Button } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// Abre/baixa o PDF do boleto retornado pelo gateway (E12.3).
export function BoletoLinkButton({ boletoUrl }: { boletoUrl: string }) {
  return (
    <Button
      variant="contained"
      startIcon={<ReceiptLongIcon />}
      href={boletoUrl}
      target="_blank"
      rel="noopener noreferrer"
      fullWidth
    >
      Abrir boleto (PDF)
    </Button>
  );
}
