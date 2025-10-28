import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FloatingAuth: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        background: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        px: 0,
        py: 0,
        alignItems: 'flex-end',
      }}
    >
        <Stack direction="column" spacing={{ xs: 0.5, sm: 1 }}>
          <Button
            variant="contained"
            sx={{
              color: '#18191c',
              background: '#fff',
              border: '1.5px solid #0078ff',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.82rem' },
              letterSpacing: 0.1,
              minWidth: 0,
              px: { xs: 1.2, sm: 1.5 },
              py: { xs: 0.3, sm: 0.5 },
              borderRadius: 2,
              boxShadow: '0 2px 8px 0 rgba(0,120,255,0.10)',
              transition: 'all 0.18s',
              lineHeight: 1.2,
              mb: 0.5,
              '&:hover': {
                background: '#e6f2ff',
                color: '#0078ff',
                borderColor: '#0078ff',
              },
            }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #0078ff 30%, #00c6fb 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.82rem' },
              letterSpacing: 0.1,
              minWidth: 0,
              px: { xs: 1.2, sm: 1.5 },
              py: { xs: 0.3, sm: 0.5 },
              borderRadius: 2,
              boxShadow: '0 2px 8px 0 rgba(0,120,255,0.10)',
              transition: 'all 0.18s',
              lineHeight: 1.2,
              '&:hover': {
                background: 'linear-gradient(90deg, #00c6fb 30%, #0078ff 100%)',
                color: '#fff',
              },
            }}
            onClick={() => navigate('/get-bike')}
          >
            Connect
          </Button>
        </Stack>
    </Box>
  );
};

export default FloatingAuth;
