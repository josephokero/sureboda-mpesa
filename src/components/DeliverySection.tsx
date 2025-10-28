
import React from 'react';
import { Box, Container, Typography, Paper, Stack, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { motion, Variants } from 'framer-motion';

const cardVariants: Variants = {
  offscreen: { y: 80, opacity: 0 },
  onscreen: {
    y: 0, opacity: 1,
    transition: { type: "spring", bounce: 0.35, duration: 1 },
  },
};

const DeliverySection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#000' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#00c6fb',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 28, md: 38 },
            textTransform: 'uppercase',
          }}
        >
          Delivery for Businesses
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          SureBoda offers reliable, affordable, and professional delivery services for shops, companies, and all types of businesses.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#00c6fb', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#ffd600', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
        <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
          <Paper elevation={0} sx={{
            flex: 1,
            background: 'rgba(24,24,24,0.98)',
            color: '#fff',
            borderRadius: 6,
            p: { xs: 5, md: 6 },
            textAlign: 'left',
            border: '1.5px solid #00c6fb',
            minWidth: 240,
            maxWidth: 370,
            mx: 'auto',
            boxShadow: '0 4px 32px 0 #000a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.3s, border 0.3s',
            '&:hover': {
              boxShadow: '0 8px 48px 0 #00c6fb33',
              border: '1.5px solid #ffd600',
            },
          }}>
            <LocalShippingIcon sx={{ fontSize: 48, color: '#00c6fb', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
              Fast & Secure Delivery
            </Typography>
            <Box sx={{ height: 3, width: 36, bgcolor: '#00c6fb', borderRadius: 2, mb: 2 }} />
            <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
              We deliver your goods to your clients quickly and safely, anywhere in the city.
            </Typography>
          </Paper>
        </motion.div>
        <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
          <Paper elevation={0} sx={{
            flex: 1,
            background: 'rgba(24,24,24,0.98)',
            color: '#fff',
            borderRadius: 6,
            p: { xs: 5, md: 6 },
            textAlign: 'left',
            border: '1.5px solid #00c6fb',
            minWidth: 240,
            maxWidth: 370,
            mx: 'auto',
            boxShadow: '0 4px 32px 0 #000a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.3s, border 0.3s',
            '&:hover': {
              boxShadow: '0 8px 48px 0 #00c6fb33',
              border: '1.5px solid #ffd600',
            },
          }}>
            <BusinessIcon sx={{ fontSize: 48, color: '#00c6fb', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
              For All Businesses
            </Typography>
            <Box sx={{ height: 3, width: 36, bgcolor: '#00c6fb', borderRadius: 2, mb: 2 }} />
            <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
              Whether you run a shop, a company, or an online store, SureBoda is your trusted delivery partner.
            </Typography>
          </Paper>
        </motion.div>
        <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
          <Paper elevation={0} sx={{
            flex: 1,
            background: 'rgba(24,24,24,0.98)',
            color: '#fff',
            borderRadius: 6,
            p: { xs: 5, md: 6 },
            textAlign: 'left',
            border: '1.5px solid #00c6fb',
            minWidth: 240,
            maxWidth: 370,
            mx: 'auto',
            boxShadow: '0 4px 32px 0 #000a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.3s, border 0.3s',
            '&:hover': {
              boxShadow: '0 8px 48px 0 #00c6fb33',
              border: '1.5px solid #ffd600',
            },
          }}>
            <EmojiPeopleIcon sx={{ fontSize: 48, color: '#00c6fb', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
              Dedicated Support
            </Typography>
            <Box sx={{ height: 3, width: 36, bgcolor: '#00c6fb', borderRadius: 2, mb: 2 }} />
            <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
              Our team is always ready to help you and your clients with any delivery needs.
            </Typography>
          </Paper>
        </motion.div>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          href="/get-bike?tab=requestDelivery"
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #00c6fb 60%, #ffd600 100%)',
            color: '#18191c',
            fontWeight: 700,
            borderRadius: 99,
            px: 5,
            py: 1.5,
            fontSize: 18,
            boxShadow: '0 2px 12px 0 rgba(0,198,251,0.10)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(90deg, #ffd600 60%, #00c6fb 100%)',
              color: '#18191c',
            },
          }}
        >
          Get Delivery Services
        </Button>
      </Box>
    </Container>
  </Box>
);


// New section for riders to apply for delivery jobs
const RiderApplySection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#111' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffd600',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Apply to be Employed
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          Are you a skilled rider with your own bike? Join SureBoda and start earning by delivering for businesses and individuals. Bring your bike, your skills, and get to work!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#ffd600', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#00c6fb', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
        <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
          <Paper elevation={0} sx={{
            flex: 1,
            background: 'rgba(24,24,24,0.98)',
            color: '#fff',
            borderRadius: 6,
            p: { xs: 5, md: 6 },
            textAlign: 'left',
            border: '1.5px solid #ffd600',
            minWidth: 240,
            maxWidth: 370,
            mx: 'auto',
            boxShadow: '0 4px 32px 0 #000a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.3s, border 0.3s',
            '&:hover': {
              boxShadow: '0 8px 48px 0 #ffd60033',
              border: '1.5px solid #00c6fb',
            },
          }}>
            <EmojiPeopleIcon sx={{ fontSize: 48, color: '#ffd600', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
              Get Delivery Jobs
            </Typography>
            <Box sx={{ height: 3, width: 36, bgcolor: '#ffd600', borderRadius: 2, mb: 2 }} />
            <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
              Work with SureBoda, deliver for businesses, and earn daily. Flexible, reliable, and rewarding.
            </Typography>
          </Paper>
        </motion.div>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          href="/get-bike?tab=delivery"
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #ffd600 60%, #00c6fb 100%)',
            color: '#18191c',
            fontWeight: 700,
            borderRadius: 99,
            px: 5,
            py: 1.5,
            fontSize: 18,
            boxShadow: '0 2px 12px 0 rgba(255,214,0,0.10)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(90deg, #00c6fb 60%, #ffd600 100%)',
              color: '#18191c',
            },
          }}
        >
          Apply as a Delivery Rider
        </Button>
      </Box>
    </Container>
  </Box>
);


// New section for bike owners to give bikes for management
const BikeOwnerSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#18191c' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#00c6fb',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Let Us Manage Your Bike
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          Own a bike of any type? Bring it to SureBoda and let us manage it for you. We assign your bike to trusted riders, ensure daily earnings, and handle all logistics. Discuss your daily target and terms with our team when you visit our office. Enjoy peace of mind and steady income while we do the work.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#00c6fb', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#ffd600', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
        <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
          <Paper elevation={0} sx={{
            flex: 1,
            background: 'rgba(24,24,24,0.98)',
            color: '#fff',
            borderRadius: 6,
            p: { xs: 5, md: 6 },
            textAlign: 'left',
            border: '1.5px solid #00c6fb',
            minWidth: 240,
            maxWidth: 370,
            mx: 'auto',
            boxShadow: '0 4px 32px 0 #000a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'box-shadow 0.3s, border 0.3s',
            '&:hover': {
              boxShadow: '0 8px 48px 0 #00c6fb33',
              border: '1.5px solid #ffd600',
            },
          }}>
            <BusinessIcon sx={{ fontSize: 48, color: '#00c6fb', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: 20, letterSpacing: 1 }}>
              Any Bike, Any Brand
            </Typography>
            <Box sx={{ height: 3, width: 36, bgcolor: '#00c6fb', borderRadius: 2, mb: 2 }} />
            <Typography sx={{ color: '#fffde7', fontSize: 16, fontWeight: 400 }}>
              We accept all types and brands of bikes. Your asset keeps working for you every day.
            </Typography>
          </Paper>
        </motion.div>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          href="/get-bike?tab=manage"
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #00c6fb 60%, #ffd600 100%)',
            color: '#18191c',
            fontWeight: 700,
            borderRadius: 99,
            px: 5,
            py: 1.5,
            fontSize: 18,
            boxShadow: '0 2px 12px 0 rgba(0,198,251,0.10)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(90deg, #ffd600 60%, #00c6fb 100%)',
              color: '#18191c',
            },
          }}
        >
          Manage My Bike
        </Button>
      </Box>
    </Container>
  </Box>
);


// Success Stories / Testimonials Section
const testimonials = [
  {
    quote: "SureBoda helped my shop deliver products faster and more reliably than ever before!",
    name: "Mercy K.",
    role: "Business Owner"
  },
  {
    quote: "I brought my bike to SureBoda and now I earn daily without any stress.",
    name: "John M.",
    role: "Bike Owner"
  },
  {
    quote: "Working as a SureBoda rider changed my life. The support and daily pay are real!",
    name: "Peter O.",
    role: "Rider"
  }
];

const SuccessStoriesSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#101114' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffd600',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Success Stories
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          Hear from our happy clients, bike owners, and riders.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#ffd600', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#00c6fb', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
        {testimonials.map((t, i) => (
          <motion.div key={i} variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }}>
            <Paper elevation={0} sx={{
              flex: 1,
              background: 'rgba(24,24,24,0.98)',
              color: '#fff',
              borderRadius: 6,
              p: { xs: 5, md: 6 },
              textAlign: 'left',
              border: '1.5px solid #ffd600',
              minWidth: 240,
              maxWidth: 370,
              mx: 'auto',
              boxShadow: '0 4px 32px 0 #000a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'box-shadow 0.3s, border 0.3s',
              '&:hover': {
                boxShadow: '0 8px 48px 0 #ffd60033',
                border: '1.5px solid #00c6fb',
              },
            }}>
              <Typography sx={{ color: '#fffde7', fontSize: 18, fontStyle: 'italic', mb: 2 }}>
                "{t.quote}"
              </Typography>
              <Typography sx={{ color: '#ffd600', fontWeight: 700, fontSize: 16 }}>{t.name}</Typography>
              <Typography sx={{ color: '#fff', fontSize: 14 }}>{t.role}</Typography>
            </Paper>
          </motion.div>
        ))}
      </Stack>
    </Container>
  </Box>
);


// ...existing code...

// FAQ Section
const faqs = [
  {
    q: "How do I get started as a rider?",
    a: (
      <>
        Click <a href="/get-bike?tab=delivery" style={{ color: '#00c6fb', textDecoration: 'underline' }}>Apply as a Delivery Rider</a>, fill out the form, and our team will contact you for onboarding.
      </>
    )
  },
  {
    q: "What types of bikes can I bring for management?",
    a: (
      <>
        We accept all types and brands of bikes. <a href="/get-bike?tab=manage" style={{ color: '#00c6fb', textDecoration: 'underline' }}>Click here to let us manage your bike</a> and discuss your daily target with our team.
      </>
    )
  },
  {
    q: "How are payments made?",
    a: (
      <>
        Payments are made daily via M-Pesa or cash at the office, depending on your preference. <a href="/get-bike?tab=manage" style={{ color: '#00c6fb', textDecoration: 'underline' }}>Learn more about bike management</a>.
      </>
    )
  },
  {
    q: "Is there support if I have issues?",
    a: (
      <>
        Yes, our support team is available 24/7 to assist you with any questions or problems. <a href="/get-bike?tab=support" style={{ color: '#00c6fb', textDecoration: 'underline' }}>Contact support</a>.
      </>
    )
  },
  {
    q: "Can businesses track their deliveries?",
    a: (
      <>
        Yes, we provide real-time updates and support for all business deliveries. <a href="/get-bike?tab=requestDelivery" style={{ color: '#00c6fb', textDecoration: 'underline' }}>Request delivery services</a>.
      </>
    )
  }
];

const FAQSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#18191c' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#00c6fb',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          Answers to common questions about SureBoda services.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#00c6fb', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#ffd600', borderRadius: 2 }} />
        </Box>
      </Box>
      <Box>
        {faqs.map((faq, i) => (
          <Accordion key={i} sx={{ background: 'rgba(24,24,24,0.98)', color: '#fff', mb: 2, borderRadius: 2, border: '1px solid #00c6fb' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffd600' }} />}>
              <Typography sx={{ fontWeight: 700, color: '#00c6fb' }}>{faq.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: '#fffde7' }} component="div">{faq.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  </Box>
);


// ...existing code...

const SafetySupportSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#000' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffd600',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Safety & Support Commitment
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          Your safety and support are our top priorities. We ensure every rider and bike is covered, trained, and supported at all times.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#ffd600', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#00c6fb', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <SecurityIcon sx={{ fontSize: 44, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Safety Protocols</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>Strict safety checks for all bikes and riders, plus regular maintenance.</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <SchoolIcon sx={{ fontSize: 44, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Rider Training</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>All riders receive professional training and onboarding before starting work.</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <VerifiedUserIcon sx={{ fontSize: 44, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Insurance Cover</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>Bikes and riders are covered with insurance for peace of mind.</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <SupportAgentIcon sx={{ fontSize: 44, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>24/7 Support</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>Our support team is always available to help you with any issues or questions.</Typography>
        </Paper>
      </Stack>
    </Container>
  </Box>
);


// ...existing code...

const EarningsBenefitsSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#101114' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#00c6fb',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Earnings & Benefits
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          See what you can earn and the benefits of joining SureBoda as a rider or bike owner.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#00c6fb', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#ffd600', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch">
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #00c6fb',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <MonetizationOnIcon sx={{ fontSize: 44, color: '#00c6fb', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Daily Earnings</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>Riders and bike owners receive daily payments based on performance and agreements.</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #00c6fb',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <EmojiEventsIcon sx={{ fontSize: 44, color: '#00c6fb', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Bonuses & Rewards</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>Top performers enjoy bonuses, rewards, and recognition for their hard work.</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #00c6fb',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <CardGiftcardIcon sx={{ fontSize: 44, color: '#00c6fb', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Extra Benefits</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>Access to exclusive offers, training, and support for all SureBoda partners.</Typography>
        </Paper>
      </Stack>
    </Container>
  </Box>
);


// Partners & Integrations Section
const partners = [
  { name: 'M-Pesa', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/M-PESA_LOGO-01.png' },
  { name: 'Jumia', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Jumia_logo.png' },
  { name: 'Safaricom', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Safaricom_logo.png' },
  { name: 'KCB Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/KCB_Group_logo.png' },
];

const PartnersSection = () => (
  <Box sx={{ py: { xs: 8, md: 10 }, background: '#18191c' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: '#ffd600',
            fontWeight: 800,
            letterSpacing: 1.5,
            mb: 1.5,
            fontSize: { xs: 22, md: 30 },
            textTransform: 'uppercase',
          }}
        >
          Our Partners & Integrations
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 16, mb: 2, fontWeight: 400 }}>
          Trusted by leading brands and payment providers.
        </Typography>
      </Box>
      <Stack direction="row" spacing={5} justifyContent="center" alignItems="center" sx={{ flexWrap: 'wrap' }}>
        {partners.map((p, i) => (
          <Box key={i} sx={{ p: 2 }}>
            <img src={p.logo} alt={p.name} style={{ height: 48, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </Box>
        ))}
      </Stack>
    </Container>
  </Box>
);


// ...existing code...

const ContactSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, background: '#000' }}>
    <Container maxWidth="md">
      <Box sx={{ mb: 7, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffd600',
            fontWeight: 900,
            letterSpacing: 2,
            mb: 1.5,
            fontSize: { xs: 26, md: 36 },
            textTransform: 'uppercase',
          }}
        >
          Contact / Visit Us
        </Typography>
        <Typography sx={{ color: '#fff', fontSize: 18, mb: 2, fontWeight: 400 }}>
          Have questions or want to join? Visit our office or reach out to us directly.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <Box sx={{ height: 3, width: 64, bgcolor: '#ffd600', borderRadius: 2, mr: 1.5 }} />
          <Box sx={{ height: 3, width: 24, bgcolor: '#00c6fb', borderRadius: 2 }} />
        </Box>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 5 }} justifyContent="center" alignItems="stretch" sx={{ mb: 6 }}>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <LocationOnIcon sx={{ fontSize: 40, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Office Location</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>SureBoda HQ, Moi Avenue, Nairobi, Kenya</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <PhoneIcon sx={{ fontSize: 40, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Phone</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>+254 700 000 000</Typography>
        </Paper>
        <Paper elevation={0} sx={{
          flex: 1,
          background: 'rgba(24,24,24,0.98)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 5, md: 6 },
          textAlign: 'left',
          border: '1.5px solid #ffd600',
          minWidth: 220,
          maxWidth: 320,
          mx: 'auto',
          boxShadow: '0 4px 32px 0 #000a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <EmailIcon sx={{ fontSize: 40, color: '#ffd600', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Email</Typography>
          <Typography sx={{ color: '#fffde7', fontSize: 15 }}>info@sureboda.com</Typography>
        </Paper>
      </Stack>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2, fontSize: 18 }}>Find us on the map:</Typography>
        <Box sx={{ width: '100%', height: 260, borderRadius: 4, overflow: 'hidden', border: '2px solid #00c6fb', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Map placeholder - replace with real map if needed */}
          <Typography sx={{ color: '#ffd600', fontWeight: 700, fontSize: 20 }}>[Google Map Here]</Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          href="tel:+254700000000"
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #ffd600 60%, #00c6fb 100%)',
            color: '#18191c',
            fontWeight: 700,
            borderRadius: 99,
            px: 5,
            py: 1.5,
            fontSize: 18,
            boxShadow: '0 2px 12px 0 rgba(255,214,0,0.10)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(90deg, #00c6fb 60%, #ffd600 100%)',
              color: '#18191c',
            },
          }}
        >
          Call Us Now
        </Button>
      </Box>
    </Container>
  </Box>
);



// Gradient highlight styles
const blueHighlight = {
  background: 'linear-gradient(135deg, #00c6fb 0%, #7f53ff 100%)',
  borderRadius: '50%',
  width: 180,
  height: 180,
  top: -60,
  left: -60,
  filter: 'blur(48px)',
  opacity: 0.5,
  zIndex: 0,
};
const purpleHighlight = {
  background: 'linear-gradient(135deg, #7f53ff 0%, #00c6fb 100%)',
  borderRadius: '50%',
  width: 140,
  height: 140,
  bottom: -40,
  right: -40,
  filter: 'blur(36px)',
  opacity: 0.4,
  zIndex: 0,
};

const DeliverySectionWithAll = () => (
  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
    {/* Animated gradient highlights */}
    <motion.div
      animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
      transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
      style={{ ...blueHighlight, position: 'absolute' }}
    />
    <motion.div
      animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
      style={{ ...purpleHighlight, position: 'absolute' }}
    />
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <DeliverySection />
      <RiderApplySection />
      <BikeOwnerSection />
      <SuccessStoriesSection />
      <FAQSection />
      <SafetySupportSection />
      <EarningsBenefitsSection />
    </Box>
  </Box>
);

export default DeliverySectionWithAll;
