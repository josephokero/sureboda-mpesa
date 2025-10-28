
import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Stack, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';


type HelpTopic = {
  title: string;
  desc: string;
  color: string;
  details: string;
};

const helpTopics: HelpTopic[] = [
  {
    title: 'Getting Started',
    desc: 'How to join SureBoda, get a company bike, and start working as a rider.',
    color: '#00c6fb',
    details: `
      <b>Getting Started with SureBoda</b><br/><br/>
      <ul>
        <li><b>Register:</b> Sign up on the platform and verify your identity.</li>
        <li><b>Apply for a Bike:</b> Complete the application form with your details and reason for joining.</li>
        <li><b>Screening:</b> Our team will review your application and contact you for next steps.</li>
        <li><b>Office Visit:</b> If selected, you will be called to the office to present your documents and pay the 200 Ksh documentation & desk fee.</li>
        <li><b>Collect Your Bike:</b> After verification, you receive a SureBoda company bike and sign all agreements at the office.</li>
        <li><b>Start Working:</b> Begin doing boda-boda, delivery, or transport business using your assigned bike. Pay your daily target and keep the rest of your earnings.</li>
      </ul>
    `,
  },
  {
    title: 'Requirements & Documents',
    desc: 'What you need to bring to the office to collect your bike.',
    color: '#ffd600',
    details: `
      <b>Requirements to Collect Your Bike</b><br/><br/>
      <ul>
        <li>200 Ksh documentation & desk fee</li>
        <li>National ID</li>
        <li>Driver's license (specifically for bike)</li>
        <li>Certificate of Good Conduct</li>
        <li>One physical family guarantor</li>
        <li>Passport photo</li>
      </ul>
      <span style="color:#ffd600;font-weight:600;">With these, you get to start working with a new bike in your possession. Agreements and contracts will be given at the office, along with more detailed information.</span>
    `,
  },
  {
    title: 'Business Model & Daily Target',
    desc: 'How the SureBoda employment and daily target system works.',
    color: '#00c6fb',
    details: `
      <b>How the SureBoda Ride Program Works</b><br/><br/>
      <ul>
        <li>You are employed to use a SureBoda company bike for boda-boda, delivery, and transport business.</li>
        <li>The bike remains company property at all times.</li>
        <li>You pay a daily target fee to the company. All earnings above the target are yours to keep.</li>
        <li>You can operate in Nairobi and nearby areas (e.g., Kajiado, Thika). Avoid Nairobi CBD unless you have official government clearance.</li>
        <li>More information and full terms are provided at the office when you collect your bike.</li>
      </ul>
    `,
  },
  {
    title: 'Safety & Security',
    desc: 'Our commitment to your safety, and tips for secure rides and business.',
    color: '#ffd600',
    details: `
      <b>Safety & Security</b><br/><br/>
      <ul>
        <li><b>Verified Riders:</b> All riders are verified for trust and safety.</li>
        <li><b>Secure Payments:</b> All transactions are encrypted and monitored.</li>
        <li><b>Emergency Support:</b> Access 24/7 help in case of incidents.</li>
        <li><b>Education:</b> Safety tips and best practices are always available.</li>
      </ul>
    `,
  },
  {
    title: 'Contact Support',
    desc: 'Need help? Reach out to our world-class support team for fast assistance.',
    color: '#00c6fb',
    details: `
      <b>Contact Support</b><br/><br/>
      <ul>
        <li><b>Live Chat:</b> Chat with our team for instant help.</li>
        <li><b>Email:</b> support@sureboda.com</li>
        <li><b>Phone:</b> +254 700 000 000</li>
        <li><b>Help Center:</b> Browse FAQs and guides for self-service.</li>
      </ul>
    `,
  },
];



const HelpCenter = () => {
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<HelpTopic | null>(null);

  const handleOpen = (topic: HelpTopic) => {
    setActiveTopic(topic);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setActiveTopic(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: '#fff', py: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1 }}>
          Help Center
        </Typography>
        <Typography sx={{ fontSize: 20, color: '#bbb', mb: 4, maxWidth: 700 }}>
          Welcome to the Sure Boda Help Center. Find answers, guides, and support for riders, owners, and investors. Our team is here to help you succeed and stay safe.
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} mb={6}>
          {helpTopics.map((topic, i) => (
            <Paper key={i} elevation={6} sx={{ flex: 1, minWidth: 220, background: '#18191c', borderRadius: 4, p: 3, borderTop: `4px solid ${topic.color}` }}>
              <Typography variant="h6" sx={{ color: topic.color, fontWeight: 800, mb: 1 }}>{topic.title}</Typography>
              <Typography sx={{ color: '#fff', fontSize: 15, mb: 2 }}>{topic.desc}</Typography>
              <Button onClick={() => handleOpen(topic)} variant="outlined" size="small" sx={{ color: topic.color, borderColor: topic.color, fontWeight: 700, borderRadius: 99, '&:hover': { background: topic.color, color: '#18191c', borderColor: topic.color } }}>
                Learn More
              </Button>
            </Paper>
          ))}
        </Stack>
        <Paper elevation={8} sx={{ background: 'linear-gradient(90deg, #18191c 60%, #232323 100%)', borderRadius: 4, p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
          <Typography variant="h5" sx={{ color: '#00c6fb', fontWeight: 900, mb: 2 }}>Still need help?</Typography>
          <Typography sx={{ color: '#bbb', mb: 2 }}>Submit your question and our support team will get back to you fast.</Typography>
          <Stack component="form" spacing={2}>
            <TextField label="Your Email" variant="filled" fullWidth sx={{ input: { color: '#fff' }, label: { color: '#bbb' }, bgcolor: '#232323', borderRadius: 2 }} />
            <TextField label="How can we help you?" variant="filled" fullWidth multiline minRows={3} sx={{ input: { color: '#fff' }, label: { color: '#bbb' }, bgcolor: '#232323', borderRadius: 2 }} />
            <Button variant="contained" sx={{ background: 'linear-gradient(90deg, #00c6fb 60%, #ffd600 100%)', color: '#18191c', fontWeight: 700, borderRadius: 99, px: 4, py: 1, fontSize: 16, alignSelf: 'flex-end' }}>Submit</Button>
          </Stack>
        </Paper>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#18191c', color: '#fff', borderRadius: 3 } }}>
          <DialogTitle sx={{ color: activeTopic?.color || '#ffd600', fontWeight: 900, fontSize: 26, pr: 5 }}>
            {activeTopic?.title}
            <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 16, top: 16, color: '#bbb' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ fontSize: 17, color: '#fff' }}>
            {activeTopic && <span dangerouslySetInnerHTML={{ __html: activeTopic.details }} />}
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#18191c', borderTop: '1px solid #232323' }}>
            <Button onClick={handleClose} sx={{ color: activeTopic?.color || '#ffd600', fontWeight: 700, borderRadius: 99 }}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default HelpCenter;
