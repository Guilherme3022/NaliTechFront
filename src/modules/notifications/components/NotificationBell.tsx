import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDateTime } from '@/shared/lib/format';
import { useMarkNotificationRead, useNotificationsQuery } from '../hooks';

// E14 — sino de notificações com contador e dropdown.
export function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data = [] } = useNotificationsQuery();
  const markRead = useMarkNotificationRead();

  const unread = data.filter((n) => !n.lida).length;

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unread} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 340, maxHeight: 420 }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1">Notificações</Typography>
          </Box>
          <Divider />
          {data.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Você está em dia. Nenhuma notificação.
              </Typography>
            </Box>
          ) : (
            <List dense sx={{ maxHeight: 340, overflow: 'auto' }}>
              {data.map((n) => (
                <ListItem
                  key={n.id}
                  alignItems="flex-start"
                  secondaryAction={
                    !n.lida && (
                      <Button size="small" onClick={() => markRead.mutate(n.id)}>
                        Lida
                      </Button>
                    )
                  }
                  sx={{ bgcolor: n.lida ? 'transparent' : 'action.hover' }}
                >
                  <ListItemText
                    primary={n.titulo}
                    secondary={
                      <>
                        {n.mensagem}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDateTime(n.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
