import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const BodaVisual = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 16 }, background: '#000', overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box
            component="img"
            src="/boda.png"
            alt="SureBoda Night Ride"
            sx={{
              width: '100%',
              borderRadius: 4,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              mb: 5,
              objectFit: 'cover',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: '#bfa046',
              fontWeight: 900,
              textAlign: 'center',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Engineered for the Future
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 400,
              textAlign: 'center',
              mt: 2,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Experience the perfect blend of cutting-edge technology, unparalleled performance, and sophisticated design.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default BodaVisual;
