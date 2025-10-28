import React, { useState } from 'react';
import { db } from '../firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Container, Typography, Stack, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

function Footer() {
  // State for email input and feedback
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'subscribe'), {
        email,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Box sx={{ bgcolor: '#0a0a0a', color: '#fff', pt: 8, pb: 4, borderTop: '2px solid #18191c', mt: 8, fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: { xs: 6, md: 0 } }}>
          {/* Branding & About */}
          <Box sx={{ flex: 2, minWidth: 220, mb: { xs: 4, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box component="img" src="/logo.jpg" alt="SureBoda Logo" sx={{ width: 48, height: 48, mr: 2, borderRadius: 2, boxShadow: '0 2px 12px #ffd60055', background: '#fff' }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffd600', letterSpacing: 1 }}>Sure Boda</Typography>
            </Box>
            <Typography sx={{ color: '#bbb', fontSize: 16, maxWidth: 340, mb: 2 }}>
              Empowering Africa’s boda-boda ecosystem with technology, transparency, and opportunity. Join the movement for safer, smarter, and more profitable rides.
            </Typography>
            <Typography sx={{ color: '#ffd600', fontWeight: 700, fontSize: 15, mb: 1 }}>Head Office</Typography>
            <Typography sx={{ color: '#bbb', fontSize: 15 }}>Kenya, Nairobi</Typography>
          </Box>
          {/* Quick Links */}
          <Box sx={{ flex: 1, minWidth: 160, mb: { xs: 4, md: 0 } }}>
            <Typography sx={{ color: '#bfa046', fontWeight: 700, mb: 2, fontSize: 17, letterSpacing: 1 }}>Quick Links</Typography>
            <Stack spacing={1.5}>
              <MuiLink component={Link} to="/" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>Home</MuiLink>
              <MuiLink component={Link} to="/about" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>About Us</MuiLink>
              <MuiLink component={Link} to="/bikes" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>Bikes</MuiLink>
              <MuiLink component={Link} to="/faqs" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>FAQs</MuiLink>
            </Stack>
          </Box>
          {/* Support & Legal */}
          <Box sx={{ flex: 1, minWidth: 160, mb: { xs: 4, md: 0 } }}>
            <Typography sx={{ color: '#bfa046', fontWeight: 700, mb: 2, fontSize: 17, letterSpacing: 1 }}>Support</Typography>
            <Stack spacing={1.5}>
              <MuiLink component={Link} to="/contact" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>Contact</MuiLink>
              <MuiLink component={Link} to="/help-center" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>Help Center</MuiLink>
              <MuiLink component={Link} to="/privacy-policy" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>Privacy Policy</MuiLink>
              <MuiLink component={Link} to="/terms-of-service" underline="hover" sx={{ color: '#fff', fontWeight: 500, fontSize: 15, '&:hover': { color: '#00c6fb' } }}>Terms of Service</MuiLink>
            </Stack>
          </Box>
          {/* Social & Newsletter */}
          <Box sx={{ flex: 1.5, minWidth: 200 }}>
            <Typography sx={{ color: '#bfa046', fontWeight: 700, mb: 2, fontSize: 17, letterSpacing: 1 }}>Connect</Typography>
            <Stack direction="row" spacing={2} mb={2}>
              <MuiLink href="https://twitter.com/sureboda" target="_blank" rel="noopener" sx={{ color: '#00c6fb', fontSize: 24 }}><i className="fab fa-twitter" /></MuiLink>
              <MuiLink href="https://facebook.com/sureboda" target="_blank" rel="noopener" sx={{ color: '#00c6fb', fontSize: 24 }}><i className="fab fa-facebook" /></MuiLink>
              <MuiLink href="https://instagram.com/sureboda" target="_blank" rel="noopener" sx={{ color: '#00c6fb', fontSize: 24 }}><i className="fab fa-instagram" /></MuiLink>
              <MuiLink href="mailto:support@sureboda.com" sx={{ color: '#00c6fb', fontSize: 24 }}><i className="fas fa-envelope" /></MuiLink>
            </Stack>
            <Typography sx={{ color: '#bbb', fontSize: 15, mb: 1 }}>Subscribe for updates</Typography>
            <Box component="form" sx={{ display: 'flex', gap: 1, mt: 1 }} onSubmit={handleSubscribe}>
              <Box
                component="input"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
                sx={{ flex: 1, px: 2, py: 1, borderRadius: 99, border: '1.5px solid #232323', background: '#18191c', color: '#fff', fontSize: 15, outline: 'none', mr: 1 }}
              />
              <Box
                component="button"
                type="submit"
                disabled={submitting}
                sx={{ px: 3, py: 1, borderRadius: 99, background: 'linear-gradient(90deg, #00c6fb 60%, #005bea 100%)', color: '#fff', fontWeight: 700, border: 'none', fontSize: 15, cursor: 'pointer', transition: 'background 0.3s', '&:hover': { background: 'linear-gradient(90deg, #005bea 60%, #00c6fb 100%)' } }}
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </Box>
            </Box>
            {success && (
              <Typography sx={{ color: '#00c6fb', fontSize: 14, mt: 1 }}>Thank you for subscribing!</Typography>
            )}
            {error && (
              <Typography sx={{ color: '#ff5252', fontSize: 14, mt: 1 }}>{error}</Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid #232323', mt: 6, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#bbb', fontSize: 14 }}>
            © {new Date().getFullYear()} SureBoda. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
