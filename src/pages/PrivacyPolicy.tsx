import React from 'react';
import { Box, Container, Typography } from '@mui/material';


import { Paper, Stack } from '@mui/material';

const PrivacyPolicy = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: '#fff', py: 10 }}>
    <Container maxWidth="md">
      <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1 }}>
        Privacy Policy
      </Typography>
      <Typography sx={{ fontSize: 20, color: '#bbb', mb: 4, maxWidth: 700 }}>
        Your privacy is our top priority. This policy explains how Sure Boda collects, uses, and protects your information, and your rights as a user.
      </Typography>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#00c6fb', fontWeight: 800, mb: 2 }}>What We Collect</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>Personal details (name, contact info, ID verification)</li>
          <li>Usage data (app activity, device info, location)</li>
          <li>Payment and transaction records</li>
        </ul>
      </Paper>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#ffd600', fontWeight: 800, mb: 2 }}>How We Use Your Data</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>To provide and improve our services</li>
          <li>To ensure safety, security, and compliance</li>
          <li>To communicate updates, offers, and support</li>
        </ul>
      </Paper>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#00c6fb', fontWeight: 800, mb: 2 }}>Your Rights & Choices</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>Access, update, or delete your data anytime</li>
          <li>Opt out of marketing communications</li>
          <li>Request data portability or restriction</li>
        </ul>
      </Paper>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#ffd600', fontWeight: 800, mb: 2 }}>How We Protect You</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>Industry-standard encryption and security</li>
          <li>Strict access controls and monitoring</li>
          <li>Regular audits and compliance checks</li>
        </ul>
      </Paper>
      <Typography sx={{ color: '#bbb', fontSize: 15, mt: 4 }}>
        For more details or to exercise your rights, please <b>contact our support team</b>.
      </Typography>
    </Container>
  </Box>
);

export default PrivacyPolicy;
