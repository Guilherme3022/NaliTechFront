import { AppBar, Avatar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthContext';

// Layout simplificado do portal do cliente (E16.1): sem sidebar.
export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" sx={{ borderBottom: '1px solid #e4e7eb', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" color="primary" sx={{ flex: 1 }}>
            Nalitech
          </Typography>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Button
            startIcon={<LogoutIcon />}
            onClick={async () => {
              await logout();
              navigate('/login', { replace: true });
            }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
