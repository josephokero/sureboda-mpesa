import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, IconButton, Stack } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // TikTok replacement
import { keyframes } from '@emotion/react';
// Glass shine animation keyframes
const shine = keyframes`
  0% { left: -75%; }
  60% { left: 110%; }
  100% { left: 110%; }
`;

// Smoke animation keyframes
const smokeFloat = keyframes`
  0% {
    opacity: 0.18;
    transform: translateY(0) scale(1) skewX(-8deg);
  }
  40% {
    opacity: 0.32;
    transform: translateY(-18px) scale(1.04) skewX(-10deg);
  }
  70% {
    opacity: 0.13;
    transform: translateY(-32px) scale(1.08) skewX(-7deg);
  }
  100% {
    opacity: 0.10;
    transform: translateY(-48px) scale(1.12) skewX(-6deg);
  }
`;

const socialLabels = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X' },
];

const Hero = () => {
  const [selectedSocial, setSelectedSocial] = useState<string | null>(null);
  // Hide label after 1.2s
  useEffect(() => {
    if (selectedSocial) {
      const t = setTimeout(() => setSelectedSocial(null), 1200);
      return () => clearTimeout(t);
    }
  }, [selectedSocial]);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '80vh', md: '100vh' },
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        background: `url('/hero.png') center center/cover no-repeat, #000`,
        overflow: 'hidden',
      }}
    >
      {/* Smoke effect SVG overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2.5,
          pointerEvents: 'none',
        }}
      >
        {/* Multiple SVG smoke clouds for realism */}
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: { xs: '10%', md: '18%' },
            top: { xs: '18%', md: '22%' },
            width: { xs: 120, md: 220 },
            height: { xs: 60, md: 110 },
            opacity: 0.18,
            filter: 'blur(2.5px)',
            animation: `${smokeFloat} 7.5s ease-in-out infinite`,
            animationDelay: '0s',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="60" rx="60" ry="30" fill="white" fillOpacity="0.18" />
            <ellipse cx="120" cy="40" rx="40" ry="22" fill="white" fillOpacity="0.13" />
            <ellipse cx="170" cy="70" rx="30" ry="18" fill="white" fillOpacity="0.10" />
          </svg>
        </Box>
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: { xs: '38%', md: '44%' },
            top: { xs: '12%', md: '16%' },
            width: { xs: 90, md: 160 },
            height: { xs: 40, md: 80 },
            opacity: 0.13,
            filter: 'blur(2.5px)',
            animation: `${smokeFloat} 8.8s ease-in-out infinite`,
            animationDelay: '2.2s',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="40" rx="50" ry="20" fill="white" fillOpacity="0.13" />
            <ellipse cx="110" cy="30" rx="30" ry="15" fill="white" fillOpacity="0.09" />
          </svg>
        </Box>
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: { xs: '65%', md: '68%' },
            top: { xs: '22%', md: '28%' },
            width: { xs: 70, md: 120 },
            height: { xs: 30, md: 60 },
            opacity: 0.10,
            filter: 'blur(2.5px)',
            animation: `${smokeFloat} 9.7s ease-in-out infinite`,
            animationDelay: '4.1s',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="30" rx="60" ry="20" fill="white" fillOpacity="0.10" />
          </svg>
        </Box>
      </Box>
      {/* Black overlay for extra contrast */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, #000 20%, rgba(0,0,0,0.07) 100%)', // Lower opacity for more image visibility
          zIndex: 2,
        }}
      />
      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          alignItems: 'flex-start',
          height: '100%',
          pt: { xs: 10, md: 16 }, // Add top padding to push content down
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            py: { xs: 10, md: 0 },
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: 2,
                color: '#fff',
                fontSize: { xs: 40, md: 80 },
                lineHeight: 1.1,
                textAlign: 'left',
                zIndex: 1,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              SUREBODA
            </Typography>
            {/* Glass shine overlay */}
            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-75%',
                  width: '60%',
                  height: '100%',
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.08) 100%)',
                  filter: 'blur(1.5px)',
                  transform: 'skewX(-18deg)',
                  animation: `${shine} 5.2s cubic-bezier(0.4,0.2,0.2,1) infinite`,
                }}
              />
            </Box>
          </Box>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 5 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#bbb',
                fontSize: { xs: 13, md: 17 },
                maxWidth: 500,
                textAlign: 'left',
                fontWeight: 400,
                zIndex: 1,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              Join us today and turn your ride into your hustle.<br />
              <Box component="span" sx={{ display: 'block', fontSize: { xs: 17, md: 22 }, color: '#fff', fontWeight: 600, mt: 0.5 }}>
                Ride smart. Ride proud. Ride with us.
              </Box>
            </Typography>
            {/* Glass shine overlay for content text */}
            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-75%',
                  width: '60%',
                  height: '100%',
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.08) 100%)',
                  filter: 'blur(1.5px)',
                  transform: 'skewX(-18deg)',
                  animation: `${shine} 5.2s cubic-bezier(0.4,0.2,0.2,1) infinite`,
                }}
              />
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: '#2196f3',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 99,
              px: 6,
              py: 2,
              fontSize: 22,
              boxShadow: '0 2px 16px #0008',
              transition: 'background 0.4s',
              '&:hover': { background: '#1976d2' },
            }}
          >
            Explore Bikes
          </Button>
        </Box>
      </Container>
      {/* Social Media Icons - bottom left */}
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 16, md: 32 },
          bottom: { xs: 64, md: 80 },
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
          {/* YouTube */}
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              component="a"
              href="https://youtube.com/"
              target="_blank"
              rel="noopener"
              sx={{ color: '#ff0000', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, p: 1 }}
              aria-label="YouTube"
              onClick={() => setSelectedSocial('youtube')}
            >
              <YouTubeIcon fontSize="medium" />
            </IconButton>
            {selectedSocial === 'youtube' && (
              <Box sx={{ fontSize: 9, color: '#ff0000', mt: 0.2, fontWeight: 700, letterSpacing: 0.2 }}>YouTube</Box>
            )}
          </Box>
          {/* TikTok */}
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              component="a"
              href="https://tiktok.com/"
              target="_blank"
              rel="noopener"
              sx={{ color: '#a020f0', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, p: 1 }}
              aria-label="TikTok"
              onClick={() => setSelectedSocial('tiktok')}
            >
              <MusicNoteIcon fontSize="medium" />
            </IconButton>
            {selectedSocial === 'tiktok' && (
              <Box sx={{ fontSize: 9, color: '#a020f0', mt: 0.2, fontWeight: 700, letterSpacing: 0.2 }}>TikTok</Box>
            )}
          </Box>
          {/* Facebook */}
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              component="a"
              href="https://facebook.com/"
              target="_blank"
              rel="noopener"
              sx={{ color: '#1877f3', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, p: 1 }}
              aria-label="Facebook"
              onClick={() => setSelectedSocial('facebook')}
            >
              <FacebookIcon fontSize="medium" />
            </IconButton>
            {selectedSocial === 'facebook' && (
              <Box sx={{ fontSize: 9, color: '#1877f3', mt: 0.2, fontWeight: 700, letterSpacing: 0.2 }}>Facebook</Box>
            )}
          </Box>
          {/* Instagram */}
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              component="a"
              href="https://instagram.com/"
              target="_blank"
              rel="noopener"
              sx={{ color: '#e1306c', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, p: 1 }}
              aria-label="Instagram"
              onClick={() => setSelectedSocial('instagram')}
            >
              <InstagramIcon fontSize="medium" />
            </IconButton>
            {selectedSocial === 'instagram' && (
              <Box sx={{ fontSize: 9, color: '#e1306c', mt: 0.2, fontWeight: 700, letterSpacing: 0.2 }}>Instagram</Box>
            )}
          </Box>
          {/* X */}
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              component="a"
              href="https://x.com/"
              target="_blank"
              rel="noopener"
              sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, p: 1 }}
              aria-label="X"
              onClick={() => setSelectedSocial('x')}
            >
              <XIcon fontSize="medium" />
            </IconButton>
            {selectedSocial === 'x' && (
              <Box sx={{ fontSize: 9, color: '#fff', mt: 0.2, fontWeight: 700, letterSpacing: 0.2 }}>X</Box>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Hero;