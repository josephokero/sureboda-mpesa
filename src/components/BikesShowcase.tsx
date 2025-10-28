import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useNavigate } from 'react-router-dom';

const bikes = [
  {
    name: 'Spiro',
    type: 'Electric',
    img: '/spiro.jpg',
    desc: 'Cutting-edge electric bike for urban mobility. Eco-friendly, efficient, and future-ready.'
  },
  {
    name: 'Ampersand',
    type: 'Electric',
    img: '/ampersand-bike.jpg',
    desc: 'Reliable electric bike with great range and performance. Perfect for city rides.'
  },
  {
    name: 'Roam',
    type: 'Electric',
    img: '/Roam.jpg',
    desc: 'Africa’s own electric bike, built for local roads and conditions.'
  },
  {
    name: 'Boxer',
    type: 'Fuel',
    img: '/boxer.avif',
    desc: 'Legendary fuel bike, known for durability and low maintenance.'
  },
  {
    name: 'TVS',
    type: 'Fuel',
    img: '/tvs.jpg',
    desc: 'Trusted fuel bike, popular for its reliability and comfort.'
  },
];

const BikesShowcase = () => {
  const navigate = useNavigate();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <Box sx={{
      py: { xs: 10, md: 16 },
      background: '#000',
      minHeight: { xs: '80vh', md: '100vh' },
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}>
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
      <Container maxWidth="xl" sx={{ px: { xs: 0, md: 4 }, position: 'relative', zIndex: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 6,
            textAlign: 'center',
            letterSpacing: 1.5,
            fontSize: { xs: 26, md: 38 },
            lineHeight: 1.1,
            fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box component="span" sx={{ color: '#fff' }}>Our</Box>
          <Box component="span" sx={{ color: '#00c6fb', ml: 1 }}>Bikes</Box>
        </Typography>
        {/* ...existing code... */}
        <Slider {...settings}>
          {bikes.map((bike, index) => (
            <Box key={index} sx={{ px: { xs: 0, md: 2 }, width: '100%' }}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'stretch',
                justifyContent: 'space-between',
                minHeight: { xs: 420, md: 520 },
                borderRadius: 8,
                background: 'linear-gradient(90deg, #18191c 60%, #232323 100%)',
                boxShadow: '0 8px 48px 0 #000a',
                overflow: 'hidden',
                p: { xs: 2, md: 0 },
                mx: 'auto',
                maxWidth: { xs: '100vw', md: 1400 },
              }}>
                {/* Left: Text */}
                <Box sx={{
                  flex: { xs: 'unset', md: 1 },
                  width: { xs: '100%', md: '45%' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: { xs: 'center', md: 'flex-start' },
                  px: { xs: 2, md: 6 },
                  py: { xs: 4, md: 0 },
                  minWidth: 0,
                  maxWidth: { xs: '100%', md: 600 },
                }}>
                  <Typography variant="h2" sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: 32, md: 54 }, mb: 2, textAlign: { xs: 'center', md: 'left' }, lineHeight: 1.1 }}>
                    {bike.name}
                  </Typography>
                  <Typography sx={{ color: '#ffd600', fontWeight: 700, mb: 2, fontSize: { xs: 18, md: 28 }, textAlign: { xs: 'center', md: 'left' } }}>
                    {bike.type} Bike
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: { xs: 16, md: 22 }, fontWeight: 500, mb: 4, textAlign: { xs: 'center', md: 'left' }, maxWidth: 600 }}>
                    {bike.desc}
                  </Typography>
                </Box>
                {/* Right: Big Image */}
                <Box sx={{
                  flex: { xs: 'unset', md: 1.5 },
                  width: { xs: '100%', md: '55%' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle at 60% 40%, #00c6fb22 0%, #232323 100%)',
                  minHeight: { xs: 220, md: 520 },
                  minWidth: { xs: '100%', md: 0 },
                  p: 0,
                  overflow: 'hidden',
                  maxWidth: { xs: '100%', md: 800 },
                }}>
                  <Box
                    component="img"
                    src={bike.img}
                    alt={bike.name + ' bike'}
                    sx={{
                      width: { xs: '100%', md: '95%' },
                      height: { xs: 260, md: 520 },
                      objectFit: 'cover',
                      borderRadius: { xs: 3, md: 8 },
                      boxShadow: '0 4px 32px #000a',
                      background: '#222',
                      transition: 'transform 0.3s',
                      mx: 'auto',
                      display: 'block',
                      '&:hover': {
                        transform: 'scale(1.04)',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Box
            component="button"
            sx={{
              background: '#000',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 99,
              px: 5,
              py: 1.5,
              fontSize: 18,
              boxShadow: '0 2px 16px #0008',
              border: '2px solid #888',
              cursor: 'pointer',
              transition: 'background 0.4s, border 0.3s',
              '&:hover': { background: '#18191c', borderColor: '#00c6fb' },
            }}
            onClick={() => navigate('/bikes')}
          >
            View Full Bike Menu
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BikesShowcase;
