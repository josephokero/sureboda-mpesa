import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const gradientBg = {
  background: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
  borderRadius: '50%',
  width: 120,
  height: 120,
  top: -40,
  left: -40,
  filter: 'blur(32px)',
  opacity: 0.7,
  zIndex: 0,
};

const gradientBg2 = {
  background: 'linear-gradient(135deg, #ffd600 0%, #ff6a00 100%)',
  borderRadius: '50%',
  width: 100,
  height: 100,
  bottom: -30,
  right: -30,
  filter: 'blur(24px)',
  opacity: 0.6,
  zIndex: 0,
};

const MissionVision: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ position: 'relative', py: { xs: 8, md: 12 }, px: 2, background: '#0a0a0a', overflow: 'hidden' }}>
    {/* Animated gradient objects */}
    <motion.div
      animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      style={{
        ...gradientBg,
        position: 'absolute',
      }}
    />
    <motion.div
      animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
      transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      style={{
        ...gradientBg2,
        position: 'absolute',
      }}
    />
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <Box sx={{ flex: 1, minWidth: 280, maxWidth: 500 }}>
        <Paper elevation={6} sx={{ p: 5, borderRadius: 5, background: 'rgba(24,24,24,0.98)', textAlign: 'center', boxShadow: '0 4px 32px 0 #00c6fb33' }}>
          <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 900, mb: 2 }}>
            Our Mission
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '1.15rem', fontWeight: 500 }}>
            To empower riders, owners, and investors with a safe, transparent, and profitable boda-boda ecosystem, transforming lives and urban mobility in Africa.
          </Typography>
        </Paper>
      </Box>
      <Box sx={{ flex: 1, minWidth: 280, maxWidth: 500 }}>
        <Paper elevation={6} sx={{ p: 5, borderRadius: 5, background: 'rgba(24,24,24,0.98)', textAlign: 'center', boxShadow: '0 4px 32px 0 #ffd60033' }}>
          <Typography variant="h4" sx={{ color: '#ffd600', fontWeight: 900, mb: 2 }}>
            Our Vision
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '1.15rem', fontWeight: 500 }}>
            To be Africa’s most trusted and innovative boda-boda platform, driving economic growth and social impact for millions.
          </Typography>
        </Paper>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{
          background: '#000',
          color: '#fff',
          fontWeight: 700,
          borderRadius: 99,
          px: 6,
          py: 2,
          fontSize: 20,
          boxShadow: '0 2px 16px #0008',
          border: '1.5px solid #888',
          transition: 'background 0.4s, border 0.3s',
          '&:hover': { background: '#18191c', borderColor: '#00c6fb' },
        }}
        onClick={() => navigate('/about')}
      >
        Learn More About Us
      </Button>
    </Box>
    {/* Removed animated motorcycle sticker as requested */}
    </Box>
  );
};

export default MissionVision;
