
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './custom-scrollbar.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppSettingsProvider, useAppSettings } from './AppSettingsContext';


const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    background: {
      default: mode === 'dark' ? '#0a0a0a' : '#fafafa',
      paper: mode === 'dark' ? '#181818' : '#fff',
    },
    primary: {
      main: mode === 'dark' ? '#111' : '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#bfa046', // gold accent
      contrastText: '#fff',
    },
    text: {
      primary: mode === 'dark' ? '#fff' : '#111',
      secondary: '#bfa046',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Roboto, Arial, sans-serif',
    h1: { fontWeight: 900, letterSpacing: 2 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? '#181818' : '#fff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark' ? '#0a0a0a' : '#fff',
          color: mode === 'dark' ? '#fff' : '#111',
        },
      },
    },
  },
});

const ThemedApp = () => {
  const { darkMode } = useAppSettings();
  const theme = React.useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppSettingsProvider>
      <ThemedApp />
    </AppSettingsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
