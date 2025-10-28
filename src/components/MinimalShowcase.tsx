import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';

const MinimalShowcase = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#111',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: 48, sm: 64 },
          bgcolor: 'rgba(24,24,24,0.98)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          boxShadow: '2px 0 16px 0 #000a',
          zIndex: 2,
        }}
      >
        <Box sx={{ mb: 6, mt: 1, width: 24, height: 3, bgcolor: '#fff', borderRadius: 2 }} />
        <Stack spacing={3} alignItems="center">
          <IconButton sx={{ color: '#fff', opacity: 0.7 }}><FacebookIcon /></IconButton>
          <IconButton sx={{ color: '#fff', opacity: 0.7 }}><InstagramIcon /></IconButton>
          <IconButton sx={{ color: '#fff', opacity: 0.7 }}><XIcon /></IconButton>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ writingMode: 'vertical-rl', color: '#aaa', fontSize: 12, letterSpacing: 2, mb: 2 }}>SUREBODA</Typography>
      </Box>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          px: { xs: 2, sm: 8, md: 16 },
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', position: 'relative' }}>
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 400,
              fontSize: { xs: 32, sm: 48, md: 56 },
              letterSpacing: 1,
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            Design<br />Thinking<br />Overnight
          </Typography>
          {/* Yellow accent lines */}
          <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ height: 4, width: 120, bgcolor: '#ffe14b', borderRadius: 2, mr: 2 }} />
            <Typography sx={{ color: '#fff', fontSize: 14, letterSpacing: 1, fontWeight: 500 }}>
              WHEN THE MORNING
            </Typography>
          </Box>
          <Box sx={{ height: 4, width: 80, bgcolor: '#ffe14b', borderRadius: 2, mt: 1 }} />
        </Box>
      </Box>
      {/* Glass overlay card (centered, optional) */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 40, md: 32 },
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '90vw', sm: 400, md: 420 },
          height: { xs: 220, md: 340 },
          bgcolor: 'rgba(24,24,24,0.72)',
          borderRadius: 4,
          boxShadow: '0 8px 48px 0 #000c',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          zIndex: 10,
        }}
      />
    </Box>
  );
};

export default MinimalShowcase;
