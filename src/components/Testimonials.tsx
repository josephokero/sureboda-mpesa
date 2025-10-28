import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    quote: "SureBoda gave me the chance to own my first bike and support my family. The process was smooth and the team is amazing!",
    author: "— James, Rider"
  },
  {
    quote: "As a bike owner, I finally have peace of mind. SureBoda’s platform is transparent and my earnings are steady.",
    author: "— Grace, Bike Owner"
  },
  {
    quote: "Investing in SureBoda has been a game changer. I see my money working and making a difference.",
    author: "— Peter, Investor"
  }
];

const Testimonials = () => {
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
    <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(120deg, #232323 60%, #18191c 100%)' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 6, textAlign: 'center', letterSpacing: 2 }}>
          What Our Community Says
        </Typography>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <Box key={index} sx={{ px: 2 }}>
              <Paper elevation={6} sx={{ p: 4, background: '#18191c', color: '#fff', borderRadius: 4, minWidth: 260, maxWidth: 540, mx: 'auto' }}>
                <Typography sx={{ fontStyle: 'italic', mb: 2, color: '#bfa046' }}>
                  “{testimonial.quote}”
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{testimonial.author}</Typography>
              </Paper>
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
};

export default Testimonials;
