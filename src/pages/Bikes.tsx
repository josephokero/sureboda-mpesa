import React from 'react';



import { Box, Container, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';

const bikes = [
  {
    id: 'E-1001',
    type: 'Electric',
    img: '/spiro.jpg',
  description: 'Our electric bikes are eco-friendly, cost-effective, and perfect for urban business. Enjoy zero fuel costs, low maintenance, and a quiet ride. Charging stations are available at key locations.',
  businessModel: 'Riders are employed to use the bike for business—boda-boda, deliveries, transport work, and more. You pay a daily target fee and keep the rest as your earnings. The bike remains company property. More information and terms will be provided at the office when you collect your bike.',
    features: [
      'Zero emissions, environmentally friendly',
      'Low running and maintenance costs',
      'Smooth, quiet operation',
      'Ideal for city deliveries and transport',
      'Charging support and guidance provided',
    ],
  },
  {
    id: 'F-2001',
    type: 'Fuel',
    img: '/boxer.avif',
  description: 'Our fuel bikes are reliable, powerful, and built for both city and rural business—boda-boda, delivery, and transport. They are easy to maintain and have a proven track record for performance and durability.',
  businessModel: 'Riders are employed to use the bike for business—boda-boda, deliveries, transport work, and more. You pay a daily target fee and keep the rest as your earnings. The bike remains company property. More information and terms will be provided at the office when you collect your bike.',
    features: [
      'High durability and performance',
      'Easy to refuel and maintain',
      'Suitable for long distances and rough roads',
      'Trusted by thousands of riders',
      'Full support and service included',
    ],
  },
];

const Bikes: React.FC = () => (
  <Box sx={{ color: '#fff', minHeight: '100vh', bgcolor: '#0a0a0a', py: 10 }}>
    <Container maxWidth="lg">
      <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1 }}>
        Our Bikes
      </Typography>
      <Typography sx={{ fontSize: 22, color: '#bbb', mb: 4, maxWidth: 900 }}>
        We provide two types of bikes for riders: <b>Electric</b> and <b>Fuel</b>. All bikes remain company property. As a rider, you are employed to use the bike for boda-boda, deliveries, transport work, and more. You pay a daily target fee and keep the rest as your earnings. More information and terms will be provided at the office when you collect your bike.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} mb={6}>
        {bikes.map((bike, i) => (
          <Paper key={bike.id} elevation={6} sx={{ flex: 1, minWidth: 260, background: '#18191c', borderRadius: 4, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box component="img" src={bike.img} alt={bike.type + ' bike'} sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 2, mb: 2, boxShadow: '0 2px 12px #00c6fb44' }} />
            <Typography variant="h5" sx={{ color: bike.type === 'Electric' ? '#00c6fb' : '#ffd600', fontWeight: 800, mb: 1 }}>{bike.type} Bike</Typography>
            <Typography sx={{ color: '#ffd600', fontWeight: 700, fontSize: 15, mb: 1 }}>ID: {bike.id}</Typography>
            <Typography sx={{ color: '#fff', fontSize: 15, mb: 1, textAlign: 'center' }}>{bike.description}</Typography>
            <Typography sx={{ color: '#bbb', fontSize: 14, mb: 1, fontStyle: 'italic', textAlign: 'center' }}>{bike.businessModel}</Typography>
            <Divider sx={{ my: 1, borderColor: '#232323' }} />
            <Typography sx={{ color: bike.type === 'Electric' ? '#00c6fb' : '#ffd600', fontWeight: 700, fontSize: 15, mb: 1 }}>Key Features</Typography>
            <ul style={{ color: '#fff', fontSize: 14, margin: 0, paddingLeft: 18, textAlign: 'left' }}>
              {bike.features.map((f, idx) => <li key={idx}>{f}</li>)}
            </ul>
          </Paper>
        ))}
      </Stack>
      {/* No comparison table needed for just two types; all details above */}
    </Container>
  </Box>
);

export default Bikes;
