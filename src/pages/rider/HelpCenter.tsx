import React, { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Stack, Divider, Alert, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { getAuth } from 'firebase/auth';
import { db } from '../../firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const HelpCenter = () => {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const faqs = [
    {
      q: 'request bike maintenance',
      a: 'Go to the Assigned Bike section and click "Request Service". Fill out the form and submit your request. Our team will respond within 1-2 business days.'
    },
    {
      q: 'bike has an issue',
      a: 'Click "Report Issue" in the Assigned Bike section, describe the problem in detail, and submit. Our support team will review and assist you promptly.'
    },
    {
      q: 'bring my bike for screening',
      a: 'You are required to bring your bike to the SureBoda Garage every 2 weeks or as agreed for screening. Failure to do so may result in repossession.'
    },
    {
      q: 'update my personal information',
      a: 'Go to the Settings section in your dashboard to update your name, email, or other details.'
    },
    {
      q: 'what is the rider dashboard',
      a: 'The Rider Dashboard is your personal control center on the SureBoda platform. Here you can view your assigned bike, manage payments, request service, report issues, access help, and update your account information.'
    },
    {
      q: 'how do i use the dashboard',
      a: 'Use the menu on the left to navigate between Overview, Assigned Bike, Payments, Reports, Help Center, and Settings. Each section provides tools and information to help you manage your SureBoda experience.'
    },
    {
      q: 'is my data secure',
      a: 'Yes, your data is securely stored and only accessible to you and authorized SureBoda staff. We use industry-standard security practices to protect your information.'
    },
    {
      q: 'can i access the dashboard on mobile',
      a: 'Yes, the SureBoda Rider Dashboard is fully responsive and can be accessed from your smartphone, tablet, or computer.'
    },
    {
      q: 'how do i log out',
      a: 'Click the Logout button at the bottom of the menu to securely sign out of your account.'
    },
    {
      q: 'how do i contact support',
      a: 'Use the Help Center form to submit your issue, or email support@sureboda.com for further assistance.'
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      setSearchResult(null);
      return;
    }
    // Find the best matching FAQ (case-insensitive, partial match)
    const found = faqs.find(faq =>
      faq.q.toLowerCase().includes(value.toLowerCase()) ||
      value.toLowerCase().includes(faq.q.toLowerCase())
    );
    if (found) {
      setSearchResult(found.a);
    } else {
      setSearchResult('Sorry, we can’t help with that. Please call support or fill the contact support form.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to submit a help request.');
      await addDoc(collection(db, 'users', user.uid, 'helpRequests'), {
        subject: form.subject,
        message: form.message,
        createdAt: serverTimestamp(),
        email: user.email || '',
        uid: user.uid
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit help request.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00c6fb', mb: 3, fontWeight: 'bold' }}>
        Help Center
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'stretch', maxWidth: 1100 }}>
        <Paper elevation={3} sx={{ flex: 1, p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#fff', minWidth: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>
            Need assistance?
          </Typography>
          <Typography sx={{ mb: 3, color: '#ccc' }}>
            Find answers to common questions, get support, or search for help with your account, bike, or payments.
          </Typography>
          {/* Search bar for issues */}
          <TextField
            placeholder="Search your issue or question..."
            variant="filled"
            fullWidth
            value={search}
            onChange={handleSearch}
            sx={{ mb: 3, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.12)', borderRadius: 2 } }}
          />
          {search && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: searchResult && searchResult.startsWith('Sorry') ? '#ff9800' : '#00c6fb', fontWeight: 600 }}>
                {searchResult}
              </Typography>
            </Box>
          )}
          {/* FAQ Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00c6fb', mb: 1 }}>Frequently Asked Questions</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#bfa046', fontWeight: 600 }}>1. How do I request bike maintenance?</Typography>
              <Typography sx={{ color: '#ccc', mb: 1 }}>{faqs[0].a}</Typography>
              <Typography sx={{ color: '#bfa046', fontWeight: 600 }}>2. What should I do if my bike has an issue?</Typography>
              <Typography sx={{ color: '#ccc', mb: 1 }}>{faqs[1].a}</Typography>
              <Typography sx={{ color: '#bfa046', fontWeight: 600 }}>3. How often should I bring my bike for screening?</Typography>
              <Typography sx={{ color: '#ccc', mb: 1 }}>{faqs[2].a}</Typography>
              <Typography sx={{ color: '#bfa046', fontWeight: 600 }}>4. How do I update my personal information?</Typography>
              <Typography sx={{ color: '#ccc', mb: 1 }}>{faqs[3].a}</Typography>
            </Box>
          </Box>
        </Paper>
        <Divider orientation={"vertical"} flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 0, background: '#00c6fb', width: '2px', borderRadius: 2 }} />
        <Paper elevation={3} sx={{ flex: 1, p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: '#fff', minWidth: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#00c6fb', fontWeight: 700 }}>Submit a Help Request</Typography>
          <Typography sx={{ mb: 2, color: '#ff9800', fontWeight: 600 }}>
            If your issue is urgent and pressing, please call our hotline.
          </Typography>
          {submitted ? (
            <Alert severity="success" sx={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', fontWeight: 700, position: 'relative', pr: 6 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setSubmitted(false)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Your help request has been received. We will get back to you soon!
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  variant="filled"
                  sx={{ input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.12)', borderRadius: 2 } }}
                  fullWidth
                />
                <TextField
                  label="How can we help you?"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  multiline
                  minRows={3}
                  variant="filled"
                  placeholder="Describe your issue or question in detail."
                  sx={{ input: { color: '#fff' }, textarea: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.12)', borderRadius: 2 } }}
                  fullWidth
                />
                {error && <Alert severity="error" sx={{ color: '#e74c3c', background: 'rgba(231,76,60,0.08)' }}>{error}</Alert>}
                <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }}>
                  Submit
                </Button>
              </Stack>
            </form>
          )}
        </Paper>
      </Box>
    </motion.div>
  );
};

export default HelpCenter;
