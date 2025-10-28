import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    q: 'How do I get a SureBoda bike?',
    a: 'Go to the Get Bike page, fill out the application form, and our team will contact you if you are selected. You will be called to the office to present your documents, pay the 200 Ksh documentation & desk fee, and collect your company bike after signing all agreements.'
  },
  {
    q: 'What are the requirements to collect my bike?',
    a: 'You need: 200 Ksh documentation & desk fee, National ID, driver\'s license (for bike), Certificate of Good Conduct, one physical family guarantor, and a passport photo.'
  },
  {
    q: 'Where can I operate as a SureBoda rider?',
    a: 'You can operate in Nairobi and nearby areas (e.g., Kajiado, Thika) for boda-boda, delivery, and transport work. Avoid Nairobi CBD unless you have official government clearance.'
  },
  {
    q: 'Do I own the bike?',
    a: 'No, all bikes remain the property of SureBoda. You are employed to use the bike for business and pay a daily target fee. All earnings above the target are yours to keep.'
  },
  {
    q: 'What is the daily target?',
    a: 'The daily target is a set fee you pay to SureBoda each day. You keep all earnings above the target. The exact amount will be explained at the office.'
  },
  {
    q: 'How do I contact SureBoda support?',
    a: 'Visit the Help Center, use the Contact page, or email support@sureboda.com. You can also call our hotline for urgent issues.'
  },
  {
    q: 'Is there training for new riders?',
    a: 'Yes, all new riders receive onboarding and safety training at the office before starting work.'
  },
  {
    q: 'How do I track my earnings?',
    a: 'Log in to your dashboard to view real-time earnings, trip history, and performance analytics.'
  },
  {
    q: 'What safety measures are in place?',
    a: 'All riders are verified, payments are secure, and we offer 24/7 support. Riders must wear safety gear and follow all traffic laws.'
  },
  {
    q: 'How do I reset my password?',
    a: 'Use the Forgot Password link on the login page to reset your password securely.'
  },
  {
    q: 'What if I have an accident or emergency?',
    a: 'Contact our support team immediately via the app or hotline. We provide emergency assistance and guidance.'
  },
  {
    q: 'Can I invest in SureBoda or own multiple bikes?',
    a: 'Currently, all bikes are company property and only assigned to employed riders. Investment and fleet options may be available in the future—contact us for updates.'
  },
  {
    q: 'What happens if I miss my daily target?',
    a: 'If you fail to pay your daily target for 2 days, you will be stopped from operating the bike. If payment is not made by the 3rd day, the bike will be repossessed by SureBoda. More details are included in the agreement you will receive at the office.'
  },
  {
    q: 'How do I get more information?',
    a: 'Visit the Help Center, contact support, or come to the office for detailed information and agreements.'
  },
];


const Faqs: React.FC = () => (
  <Box sx={{ maxWidth: 900, margin: '0 auto', py: 8, bgcolor: '#0a0a0a', borderRadius: 4, boxShadow: '0 4px 32px #000a' }}>
    <Typography variant="h2" sx={{ color: '#ffd600', fontWeight: 900, mb: 4, textAlign: 'center', letterSpacing: 1 }}>
      Frequently Asked Questions
    </Typography>
    <Typography sx={{ color: '#bbb', fontSize: 18, mb: 5, textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
      Everything you need to know about SureBoda—riding, investing, safety, support, and more. If you can’t find your answer here, visit our Help Center or contact support.
    </Typography>
    {faqs.map((faq, idx) => (
      <Accordion key={idx} sx={{ background: '#18191c', color: '#fff', mb: 2, borderRadius: 2, boxShadow: '0 2px 12px #23232355' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00c6fb' }} />}>
          <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{faq.q}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ color: '#bbb', fontSize: 16 }}>{faq.a}</Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);

export default Faqs;
