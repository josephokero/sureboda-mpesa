import React from 'react';
import KenyaMap from '../components/KenyaMap';





import { Box, Container, Typography, Paper, Stack, Divider } from '@mui/material';

const Ride: React.FC = () => (
  <Box sx={{ color: '#fff', minHeight: '100vh', bgcolor: '#0a0a0a', py: 10 }}>
    <Container maxWidth="lg">
      <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1, textAlign: 'center' }}>
        Ride & Do Business with Sure <span style={{ color: '#00c6fb', fontWeight: 900 }}>Boda</span>
      </Typography>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6, mt: 4 }}>
        <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 800, mb: 2, textAlign: 'center' }}>How the SureBoda Ride Program Works</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="flex-start" mb={2}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ color: '#ffd600', fontWeight: 700, mb: 1 }}>1. Register</Typography>
            <Typography sx={{ color: '#fff', fontSize: 15 }}>Sign up and verify your identity to join the SureBoda platform.</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ color: '#ffd600', fontWeight: 700, mb: 1 }}>2. Get a Company Bike</Typography>
            <Typography sx={{ color: '#fff', fontSize: 15 }}>Receive an electric or fuel bike from SureBoda. The bike remains company property.</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ color: '#ffd600', fontWeight: 700, mb: 1 }}>3. Do Business</Typography>
            <Typography sx={{ color: '#fff', fontSize: 15 }}>Use the bike for boda-boda, deliveries, transport work, and more. You are employed to do business for the company.</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ color: '#ffd600', fontWeight: 700, mb: 1 }}>4. Daily Target Fee</Typography>
            <Typography sx={{ color: '#fff', fontSize: 15 }}>Pay a daily target fee to the company. All earnings above the target are yours to keep.</Typography>
          </Box>
        </Stack>
        <Box sx={{ background: '#232323', color: '#ffd600', borderRadius: 2, p: 2, mt: 3, fontWeight: 600, fontSize: 15, textAlign: 'center' }}>
          More information and full terms will be provided at the office when you collect your bike.
        </Box>
      </Paper>
      <Divider sx={{ my: 6, borderColor: '#232323' }} />
      <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 800, mb: 3, textAlign: 'center' }}>Permitted Business Zone</Typography>
      <Paper elevation={4} sx={{ background: '#232323', borderRadius: 4, p: 4, mb: 6, maxWidth: 700, mx: 'auto' }}>
        <Typography sx={{ fontSize: 18, color: '#fff', mb: 2, textAlign: 'center' }}>
          You can operate in Nairobi and nearby areas (e.g., Kajiado, Thika) for boda-boda, delivery, and transport work. <br />
          <span style={{ color: '#ffb300', fontWeight: 600 }}>Avoid Nairobi CBD (town) unless you have official government clearance to operate there.</span>
        </Typography>
        <Box sx={{ background: '#2a1a1a', color: '#ffb300', p: 2, borderRadius: 2, fontWeight: 600, fontSize: 17, textAlign: 'center' }}>
          <b>Important:</b> Nairobi CBD is restricted. Only operate there if you have government approval.
        </Box>
      </Paper>
      <Divider sx={{ my: 6, borderColor: '#232323' }} />
      <Typography variant="h4" sx={{ color: '#ffd600', fontWeight: 800, mb: 3, textAlign: 'center' }}>Safety & Success Tips</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="flex-start" mb={6}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ color: '#00c6fb', fontWeight: 700, mb: 1 }}>Follow Local Laws</Typography>
          <Typography sx={{ color: '#fff', fontSize: 15 }}>Always respect traffic rules and business regulations for your safety and success.</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ color: '#00c6fb', fontWeight: 700, mb: 1 }}>Stay Connected</Typography>
          <Typography sx={{ color: '#fff', fontSize: 15 }}>Use the SureBoda app for updates, support, and business insights.</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ color: '#00c6fb', fontWeight: 700, mb: 1 }}>Prioritize Safety</Typography>
          <Typography sx={{ color: '#fff', fontSize: 15 }}>Wear safety gear, keep your bike maintained, and report any incidents promptly.</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 6, borderColor: '#232323' }} />
      <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 800, mb: 3, textAlign: 'center' }}>Where We Operate</Typography>
      <Box sx={{ width: '100%', height: { xs: 320, md: 520 }, background: '#111', borderRadius: 4, boxShadow: '0 2px 24px 0 rgba(0,0,0,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 6 }}>
        <KenyaMap />
      </Box>
      <Typography sx={{ fontSize: 18, color: '#bbb', textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
        SureBoda is committed to safe, legal, and profitable operations. Always follow local regulations and respect restricted zones for your safety and business success.
      </Typography>
    </Container>
  </Box>
);

export default Ride;
