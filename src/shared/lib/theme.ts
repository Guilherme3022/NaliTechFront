import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

// Tema base: cores neutras + tipografia limpa (E0.2).
export const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: { main: '#1f2933' },
      secondary: { main: '#3d7fff' },
      background: { default: '#f4f5f7', paper: '#ffffff' },
      success: { main: '#2e7d32' },
      warning: { main: '#ed6c02' },
      error: { main: '#c62828' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e4e7eb' } } },
      MuiButton: { defaultProps: { disableElevation: true } },
    },
  },
  ptBR,
);
