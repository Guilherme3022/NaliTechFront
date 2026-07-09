import {
  Alert,
  Box,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { formatBytes, formatDateTime } from '@/shared/lib/format';
import { EmptyState } from '@/shared/components/states';
import type { UploadResponse } from '../types';
import { UploadStatusChip } from './UploadStatusChip';

// Item local ainda enviando (progresso de upload), antes de virar registro no backend.
export interface LocalUploadItem {
  tempId: string;
  name: string;
  size: number;
  progress: number;
  error?: string;
}

interface Props {
  localItems: LocalUploadItem[];
  items: UploadResponse[];
  onDelete: (id: string) => void;
}

export function UploadQueueList({ localItems, items, onDelete }: Props) {
  const navigate = useNavigate();

  if (localItems.length === 0 && items.length === 0) {
    return (
      <EmptyState
        title="Fila vazia"
        description="Os arquivos enviados aparecerão aqui com o status de processamento."
      />
    );
  }

  return (
    <List>
      {/* Uploads em andamento (client-side) */}
      {localItems.map((item) => (
        <ListItem key={item.tempId} divider>
          <ListItemText
            primary={item.name}
            secondary={
              <Box sx={{ mt: 0.5 }}>
                {item.error ? (
                  <Alert severity="error" sx={{ py: 0 }}>
                    {item.error}
                  </Alert>
                ) : (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(item.size)} · enviando {item.progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={item.progress} sx={{ mt: 0.5 }} />
                  </>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}

      {/* Uploads registrados no backend */}
      {items.map((item) => (
        <ListItem
          key={item.id}
          divider
          secondaryAction={
            <Stack direction="row">
              <Tooltip title="Ver detalhe do processamento">
                <IconButton edge="end" onClick={() => navigate(`/uploads/${item.id}`)}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remover">
                <IconButton edge="end" onClick={() => onDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        >
          <ListItemText
            primary={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{item.nomeOriginal}</span>
                <UploadStatusChip status={item.status} />
              </Stack>
            }
            secondary={
              <>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(item.tamanho)} · {item.etapaAtual ?? '—'} · {formatDateTime(item.createdAt)}
                </Typography>
                {item.status === 'ERRO' && item.erroMensagem && (
                  <Alert severity="error" sx={{ mt: 0.5, py: 0 }}>
                    {item.erroMensagem}
                  </Alert>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
