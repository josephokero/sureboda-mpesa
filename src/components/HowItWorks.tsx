import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
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

const HowItWorks = () => {
  return (
    <Box sx={{ py: { xs: 10, md: 14 }, background: '#000' }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 7, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              color: '#fff',
              fontWeight: 900,
              letterSpacing: 2,
              mb: 1.5,
              fontSize: { xs: 28, md: 38 },
              textTransform: 'uppercase',
            }}
          >
            How SureBoda Works
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <Box sx={{ height: 3, width: 64, bgcolor: '#ffd600', borderRadius: 2, mr: 1.5 }} />
            <Box sx={{ height: 3, width: 24, bgcolor: '#ffd600', borderRadius: 2 }} />
          </Box>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
          <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper elevation={0} sx={{
              flex: 1,
              background: 'rgba(24,24,24,0.98)',
              color: '#fff',
              borderRadius: 6,
              p: { xs: 5, md: 6 },
              textAlign: 'left',
              border: '1.5px solid #888',
              minWidth: 240,
              maxWidth: 370,
              mx: 'auto',
              boxShadow: '0 4px 32px 0 #000a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'box-shadow 0.3s, border 0.3s',
              '&:hover': {
                boxShadow: '0 8px 48px 0 #ffd60033',
                border: '1.5px solid #ffd600',
              },
            }}>
              <DirectionsBikeIcon sx={{ fontSize: 48, color: '#ffd600', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
                Apply or List a Bike
              </Typography>
              <Box sx={{ height: 3, width: 36, bgcolor: '#ffd600', borderRadius: 2, mb: 2 }} />
              <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
                Riders apply for bikes. Owners list their bikes. Investors fund opportunities.
              </Typography>
            </Paper>
          </motion.div>
          <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper elevation={0} sx={{
              flex: 1,
              background: 'rgba(24,24,24,0.98)',
              color: '#fff',
              borderRadius: 6,
              p: { xs: 5, md: 6 },
              textAlign: 'left',
              border: '1.5px solid #888',
              minWidth: 240,
              maxWidth: 370,
              mx: 'auto',
              boxShadow: '0 4px 32px 0 #000a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'box-shadow 0.3s, border 0.3s',
              '&:hover': {
                boxShadow: '0 8px 48px 0 #ffd60033',
                border: '1.5px solid #ffd600',
              },
            }}>
              <GroupsIcon sx={{ fontSize: 48, color: '#ffd600', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
                Smart Matching
              </Typography>
              <Box sx={{ height: 3, width: 36, bgcolor: '#ffd600', borderRadius: 2, mb: 2 }} />
              <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
                Our platform matches riders, bikes, and investors for maximum impact and reliability.
              </Typography>
            </Paper>
          </motion.div>
          <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper elevation={0} sx={{
              flex: 1,
              background: 'rgba(24,24,24,0.98)',
              color: '#fff',
              borderRadius: 6,
              p: { xs: 5, md: 6 },
              textAlign: 'left',
              border: '1.5px solid #888',
              minWidth: 240,
              maxWidth: 370,
              mx: 'auto',
              boxShadow: '0 4px 32px 0 #000a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'box-shadow 0.3s, border 0.3s',
              '&:hover': {
                boxShadow: '0 8px 48px 0 #ffd60033',
                border: '1.5px solid #ffd600',
              },
            }}>
              <SavingsIcon sx={{ fontSize: 48, color: '#ffd600', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
                Earn & Grow
              </Typography>
              <Box sx={{ height: 3, width: 36, bgcolor: '#ffd600', borderRadius: 2, mb: 2 }} />
              <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
                Everyone benefits: riders earn, owners profit, investors grow their savings.
              </Typography>
            </Paper>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
};

export default HowItWorks;
