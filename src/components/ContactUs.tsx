
import React, { useState } from 'react';
import { db } from '../firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Paper, Stack, Grid, Divider, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';



const ContactUs: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contacting'), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, margin: '0 auto', py: 7, px: 2 }}>
      <Paper elevation={8} sx={{ p: { xs: 2, sm: 5 }, borderRadius: 5, background: '#18191c', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5 }}>
        {/* Left: Company Info */}
        <Box sx={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
          <Typography variant="h4" sx={{ color: '#00aaff', fontWeight: 900, mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
            Contact Us
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '1.1rem', mb: 2 }}>
            We’d love to hear from you! Reach out for support, partnership, or general inquiries. Our team is ready to help you 7 days a week.
          </Typography>
          <Divider sx={{ my: 2, background: '#222' }} />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <LocationOnIcon sx={{ color: '#00aaff' }} />
            <Typography sx={{ color: '#fff' }}>SureBoda HQ, Nairobi, Kenya</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <PhoneIcon sx={{ color: '#00aaff' }} />
            <Typography sx={{ color: '#fff' }}>+254 700 000 000</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <EmailIcon sx={{ color: '#00aaff' }} />
            <Typography sx={{ color: '#fff' }}>support@sureboda.com</Typography>
          </Stack>
          <Divider sx={{ my: 2, background: '#222' }} />
          <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <IconButton href="https://facebook.com/sureboda" target="_blank" rel="noopener" sx={{ color: '#00aaff' }}><FacebookIcon /></IconButton>
            <IconButton href="https://twitter.com/sureboda" target="_blank" rel="noopener" sx={{ color: '#00aaff' }}><TwitterIcon /></IconButton>
            <IconButton href="https://instagram.com/sureboda" target="_blank" rel="noopener" sx={{ color: '#00aaff' }}><InstagramIcon /></IconButton>
          </Stack>
        </Box>
        {/* Divider for desktop */}
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 3, background: '#222' }} />
        {/* Right: Contact Form */}
        <Box sx={{ flex: 1, minWidth: 320 }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
            Send Us a Message
          </Typography>
          <Stack spacing={3} component="form" autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              sx={{ input: { color: '#fff' } }}
              required
              disabled={submitting}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              sx={{ input: { color: '#fff' } }}
              required
              type="email"
              disabled={submitting}
            />
            <TextField
              label="Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              sx={{ textarea: { color: '#fff' } }}
              required
              disabled={submitting}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, background: '#00aaff', color: '#fff', '&:hover': { background: '#0077b6' } }}
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
            {success && (
              <Typography sx={{ color: '#00c6fb', fontSize: 15, textAlign: 'center' }}>Thank you for contacting us! We will get back to you soon.</Typography>
            )}
            {error && (
              <Typography sx={{ color: '#ff5252', fontSize: 15, textAlign: 'center' }}>{error}</Typography>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ContactUs;
