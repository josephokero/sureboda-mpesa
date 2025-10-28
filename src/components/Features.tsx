import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SavingsIcon from '@mui/icons-material/Savings';
import { motion } from 'framer-motion';

const cardVariants = {
  offscreen: {
    y: 100,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 1,
    },
  },
};

const Features = () => {
  return (
    <Box
      sx={{
        py: { xs: 12, md: 18 },
        background: '#000',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Animated blue gradient background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 70% 20%, #4fc3f733 0%, transparent 80%), radial-gradient(ellipse 60% 40% at 20% 80%, #1976d233 0%, transparent 80%)',
          animation: 'sb-gradient-move 12s ease-in-out infinite',
          '@keyframes sb-gradient-move': {
            '0%': { backgroundPosition: '70% 20%, 20% 80%' },
            '50%': { backgroundPosition: '60% 30%, 30% 70%' },
            '100%': { backgroundPosition: '70% 20%, 20% 80%' },
          },
        }}
      />
  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 2, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.1 }}>
          Why Choose <span style={{ color: '#4fc3f7', letterSpacing: 3 }}>SureBoda</span>?
        </Typography>
        <Typography variant="h6" sx={{ color: '#4fc3f7', textAlign: 'center', mb: 7, fontWeight: 500, letterSpacing: 1 }}>
          Engineered for the Future. Trusted by Riders, Owners, and Investors.
        </Typography>
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={{ xs: 4, sm: 6, md: 8 }}
    justifyContent="center"
    alignItems={{ xs: 'center', sm: 'stretch' }}
    sx={{ width: '100%', maxWidth: '100vw', flexWrap: { xs: 'nowrap', sm: 'nowrap' } }}
  >
          <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                background: 'rgba(30,34,40,0.75)',
                color: '#fff',
                borderRadius: { xs: '40px', sm: '48px', md: '56px' },
                p: { xs: 3, sm: 5, md: 7 },
                textAlign: 'center',
                border: '1.5px solid #333',
                minWidth: { xs: '90vw', sm: 300, md: 340 },
                maxWidth: { xs: '98vw', sm: 400, md: 400 },
                mx: { xs: 'auto', sm: 2, md: 3 },
                mb: { xs: 3, sm: 0 },
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                transition: 'box-shadow 0.3s, border 0.3s, transform 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 24px 0 #0004',
                  border: '1.5px solid #444',
                  background: 'rgba(40,44,54,0.85)',
                  transform: 'translateY(-6px) scale(1.02)',
                },
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: { xs: 48, sm: 60, md: 72 }, color: '#4fc3f7', mb: 2 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 2, letterSpacing: 1, fontSize: { xs: 22, sm: 26, md: 32 } }}>
                Empowering Riders
              </Typography>
              <Typography sx={{ color: '#bbb', fontSize: { xs: 15, sm: 18, md: 22 }, fontWeight: 400, mt: 2, mb: 2 }}>
                Access to quality bikes, fair terms, and a supportive community for every rider.<br/>
                <span style={{ color: '#4fc3f7', fontWeight: 600 }}>• Rider training & safety programs<br/>• Flexible payment plans<br/>• 24/7 support</span>
              </Typography>
            </Paper>
          </motion.div>
          <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                background: 'rgba(30,34,40,0.75)',
                color: '#fff',
                borderRadius: 18,
                p: 7,
                textAlign: 'center',
                border: '1.5px solid #333',
                minWidth: 340,
                maxWidth: 400,
                mx: 'auto',
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                transition: 'box-shadow 0.3s, border 0.3s, transform 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 24px 0 #0004',
                  border: '1.5px solid #444',
                  background: 'rgba(40,44,54,0.85)',
                  transform: 'translateY(-6px) scale(1.02)',
                },
              }}
            >
              <GroupsIcon sx={{ fontSize: { xs: 48, sm: 60, md: 72 }, color: '#4fc3f7', mb: 2 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 2, letterSpacing: 1, fontSize: { xs: 22, sm: 26, md: 32 } }}>
                Supporting Bike Owners
              </Typography>
              <Typography sx={{ color: '#bbb', fontSize: { xs: 15, sm: 18, md: 22 }, fontWeight: 400, mt: 2, mb: 2 }}>
                Seamless management, reliable riders, and transparent earnings for every bike owner.<br/>
                <span style={{ color: '#4fc3f7', fontWeight: 600 }}>• Real-time bike tracking<br/>• Automated payments<br/>• Owner dashboard</span>
              </Typography>
            </Paper>
          </motion.div>
          <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                background: 'rgba(30,34,40,0.75)',
                color: '#fff',
                borderRadius: 18,
                p: 7,
                textAlign: 'center',
                border: '1.5px solid #333',
                minWidth: 340,
                maxWidth: 400,
                mx: 'auto',
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                transition: 'box-shadow 0.3s, border 0.3s, transform 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 24px 0 #0004',
                  border: '1.5px solid #444',
                  background: 'rgba(40,44,54,0.85)',
                  transform: 'translateY(-6px) scale(1.02)',
                },
              }}
            >
              <SavingsIcon sx={{ fontSize: { xs: 48, sm: 60, md: 72 }, color: '#4fc3f7', mb: 2 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 2, letterSpacing: 1, fontSize: { xs: 22, sm: 26, md: 32 } }}>
                Enabling Investors
              </Typography>
              <Typography sx={{ color: '#bbb', fontSize: { xs: 15, sm: 18, md: 22 }, fontWeight: 400, mt: 2, mb: 2 }}>
                Grow your wealth by investing in mobility, with full transparency and security.<br/>
                <span style={{ color: '#4fc3f7', fontWeight: 600 }}>• High-yield returns<br/>• Secure investments<br/>• Transparent reporting</span>
              </Typography>
            </Paper>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
};

export default Features;
