import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E41815'
    },
    secondary: {
      main: '#E6E6DC'
    },
    background: {
      default: '#E6E6DC',
      paper: '#f5f3eb'
    },
    text: {
      primary: '#1C1C1C',
      secondary: '#666666'
    },
    warning: {
      main: '#ADA072'
    }
  },
  typography: {
    fontFamily: ['Archivo', 'Roboto', 'system-ui', 'sans-serif'].join(','),
    h1: {
      fontWeight: 900,
      textTransform: 'uppercase'
    },
    h2: {
      fontWeight: 800,
      textTransform: 'uppercase'
    },
    subtitle2: {
      fontFamily: 'Roboto Mono, monospace'
    },
    button: {
      fontWeight: 700,
      textTransform: 'uppercase'
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      }
    }
  }
});

export default theme;
