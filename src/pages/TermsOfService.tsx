import React from 'react';
import { Box, Container, Typography } from '@mui/material';


import { Paper, Stack } from '@mui/material';

const TermsOfService = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: '#fff', py: 10 }}>
    <Container maxWidth="md">
      <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1 }}>
        Terms of Service
      </Typography>
      <Typography sx={{ fontSize: 20, color: '#bbb', mb: 4, maxWidth: 700 }}>
        Please read these terms carefully before using Sure Boda. By accessing or using our platform, you agree to these terms and conditions.
      </Typography>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#00c6fb', fontWeight: 800, mb: 2 }}>User Responsibilities</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>Use Sure Boda services responsibly and lawfully</li>
          <li>Provide accurate information and keep your account secure</li>
          <li>Respect the rights, privacy, and safety of other users</li>
        </ul>
      </Paper>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#ffd600', fontWeight: 800, mb: 2 }}>Platform Content</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>All content, trademarks, and data belong to Sure Boda</li>
          <li>Do not copy, distribute, or misuse platform materials</li>
        </ul>
      </Paper>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#00c6fb', fontWeight: 800, mb: 2 }}>Service Changes & Updates</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>We may update these terms and our services as needed</li>
          <li>Continued use means you accept any changes</li>
        </ul>
      </Paper>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#ffd600', fontWeight: 800, mb: 2 }}>Contact & Support</Typography>
        <ul style={{ color: '#fff', fontSize: 16, marginLeft: 20 }}>
          <li>Contact our support team for any questions or disputes</li>
          <li>We are committed to fair, transparent, and prompt resolution</li>
        </ul>
      </Paper>
      <Typography sx={{ color: '#bbb', fontSize: 15, mt: 4 }}>
        For full legal details, please contact our legal team or visit the Help Center.
      </Typography>
    </Container>
  </Box>
);

export default TermsOfService;
