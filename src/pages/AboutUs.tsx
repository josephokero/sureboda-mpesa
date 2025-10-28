import React from 'react';



import { Box, Container, Typography, Paper, Stack, Avatar, Divider } from '@mui/material';

const team = [
  { name: 'Joseph Nyarandi', role: 'Founder, CEO', img: '/founder.PNG' },
  { name: 'Stephen Motuka', role: 'Head Executive Manager', img: '/stephen.jpg' },
  { name: 'Mwendwa Emmanuel', role: 'Shareholder', img: '/mwendwa.jpg' },
];

const values = [
  { title: 'Safety First', desc: 'We prioritize the safety of our riders, owners, and investors in every decision.' },
  { title: 'Transparency', desc: 'We operate with honesty and openness, building trust at every step.' },
  { title: 'Empowerment', desc: 'We create opportunities for economic growth and personal success.' },
  { title: 'Innovation', desc: 'We leverage technology to transform urban mobility in Africa.' },
];

const AboutUs: React.FC = () => (
  <Box sx={{ color: '#fff', minHeight: '100vh', bgcolor: '#0a0a0a', py: 10 }}>
    <Container maxWidth="lg">
      <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1 }}>
        About SureBoda
      </Typography>
      <Typography sx={{ fontSize: 22, color: '#bbb', mb: 4, maxWidth: 900 }}>
        SureBoda is Africa’s most trusted, innovative boda-boda platform. We empower riders, owners, and investors with a safe, transparent, and profitable ecosystem—transforming lives and urban mobility across Kenya and beyond.
      </Typography>
      <Paper elevation={6} sx={{ background: '#18191c', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 800, mb: 2 }}>Our Mission</Typography>
        <Typography sx={{ fontSize: 18, color: '#fff', mb: 2 }}>
          To empower Africa’s boda-boda community with technology, opportunity, and trust.
        </Typography>
        <Typography variant="h4" sx={{ color: '#ffd600', fontWeight: 800, mb: 2, mt: 4 }}>Our Vision</Typography>
        <Typography sx={{ fontSize: 18, color: '#fff' }}>
          To be the leading force in safe, smart, and sustainable urban mobility for millions.
        </Typography>
      </Paper>
      <Divider sx={{ my: 6, borderColor: '#232323' }} />
      <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 800, mb: 3 }}>Our Story</Typography>
      <Typography sx={{ fontSize: 18, color: '#bbb', mb: 4, maxWidth: 900 }}>
        Founded in 2025, SureBoda was born from a passion to transform urban transport and create economic opportunities for thousands. Our journey began in Nairobi, and today, we’re building a movement that’s changing lives across Kenya.
      </Typography>
      <Paper elevation={4} sx={{ background: '#232323', borderRadius: 4, p: 4, mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#ffd600', fontWeight: 700, mb: 2 }}>Our Values</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          {values.map((v, i) => (
            <Box key={i} sx={{ flex: 1, minWidth: 180 }}>
              <Typography variant="h6" sx={{ color: '#00c6fb', fontWeight: 700 }}>{v.title}</Typography>
              <Typography sx={{ color: '#fff', fontSize: 15 }}>{v.desc}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      <Divider sx={{ my: 6, borderColor: '#232323' }} />
      <Typography variant="h4" sx={{ color: '#ffd600', fontWeight: 800, mb: 3 }}>Our Team</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} mb={6}>
        {team.map((member, i) => (
          <Paper key={i} elevation={3} sx={{ background: '#18191c', borderRadius: 4, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
            <Avatar src={member.img} alt={member.name} sx={{ width: 72, height: 72, mb: 2, bgcolor: '#ffd600', color: '#18191c', fontWeight: 900, fontSize: 32 }}>
              {member.name[0]}
            </Avatar>
            <Typography variant="h6" sx={{ color: '#00c6fb', fontWeight: 700 }}>{member.name}</Typography>
            <Typography sx={{ color: '#bbb', fontSize: 15 }}>{member.role}</Typography>
          </Paper>
        ))}
      </Stack>
      <Divider sx={{ my: 6, borderColor: '#232323' }} />
      <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 800, mb: 3 }}>Our Timeline</Typography>
      <Stack spacing={2} mb={6}>
        <Paper elevation={2} sx={{ background: '#18191c', borderRadius: 3, p: 2 }}>
          <Typography sx={{ color: '#ffd600', fontWeight: 700 }}>2025</Typography>
          <Typography sx={{ color: '#fff' }}>SureBoda founded in Nairobi, Kenya</Typography>
        </Paper>
        <Paper elevation={2} sx={{ background: '#18191c', borderRadius: 3, p: 2 }}>
          <Typography sx={{ color: '#ffd600', fontWeight: 700 }}>2026</Typography>
          <Typography sx={{ color: '#fff' }}>Launched first digital platform for riders and owners</Typography>
        </Paper>
      </Stack>
    </Container>
  </Box>
);

export default AboutUs;
