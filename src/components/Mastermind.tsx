import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';

const Mastermind = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: '90vh', md: '120vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        zIndex: 1,
        py: { xs: 12, md: 20 },
        my: { xs: 0, md: 0 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'center',
          minHeight: '100%',
          gap: { xs: 4, sm: 6, md: 10 },
          px: { xs: 0, sm: 2, md: 4 },
        }}
      >
        {/* Circular profile card for helmet image */}
        <Box
          sx={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 140, sm: 180, md: 220, lg: 260 },
            height: { xs: 140, sm: 180, md: 220, lg: 260 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #181c22 60%, #23272f 100%)',
            boxShadow: '0 4px 32px 0 #000a',
            overflow: 'hidden',
            border: '4px solid #222',
            mx: { xs: 'auto', md: 0 },
            mb: { xs: 3, md: 0 },
          }}
        >
          <Box
            component="img"
            src="/helmet.png"
            alt="Rider helmet profile"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              filter: 'brightness(0.98)',
            }}
          />
        </Box>
        {/* Glass card with grey border and title */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            width: '100%',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              background: 'rgba(30,34,40,0.82)',
              border: '2px solid #888',
              borderRadius: { xs: '24px', sm: '32px', md: '48px' },
              px: { xs: 2, sm: 4, md: 8, lg: 10 },
              py: { xs: 4, sm: 6, md: 8 },
              boxShadow: '0 8px 48px 0 #000a',
              backdropFilter: 'blur(10px) saturate(120%)',
              WebkitBackdropFilter: 'blur(10px) saturate(120%)',
              minWidth: { xs: 200, sm: 260, md: 340 },
              maxWidth: { xs: '100%', sm: 420, md: 540 },
              textAlign: { xs: 'center', md: 'left' },
              mx: { xs: 'auto', md: 0 },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 20, sm: 26, md: 32 },
                  letterSpacing: 2,
                  color: '#fff',
                  textShadow: '0 2px 12px #000a',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                How to Start Riding With Us
              </Typography>
            </Box>
            {/* You can add steps or content here if needed */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Mastermind;
