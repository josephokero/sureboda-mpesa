import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Container, Typography, Paper, TextField, Button, Snackbar, Alert, Tabs, Tab, Drawer, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { db } from '../firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
const applicationTypes = [
  { label: 'Book Appointment', key: 'appointment' },
  { label: 'Apply as Delivery Person', key: 'delivery' },
  { label: 'Give Out Bike for Management', key: 'manage' },
  { label: 'Request Delivery Service', key: 'requestDelivery' },
  { label: 'Apply for a Bike', key: 'getBike' },
] as const;

type ApplicationTab = typeof applicationTypes[number]['key'];

const formsInitial: Record<ApplicationTab, any> = {
  appointment: { name: '', phone: '', date: '', time: '', reason: '' },
  delivery: { name: '', phone: '', email: '', experience: '', license: '' },
  manage: { name: '', phone: '', email: '', bikeModel: '', plate: '', terms: '' },
  requestDelivery: { name: '', phone: '', email: '', business: '', packageType: '', frequency: '' },
  getBike: { name: '', phone: '', email: '', idNumber: '', address: '', reason: '', otherReason: '' },
};

const GetBike: React.FC = () => {
  // Mobile menu Drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Requirements content for each application type
  const requirementsContent: Record<ApplicationTab, { title: string; list: string[]; highlight?: string; extra?: string }> = {
    appointment: {
      title: 'Requirements to Collect Your Bike',
      list: [
        '200 Ksh documentation & desk fee',
        'National ID',
        "Driver's license (specifically for bike)",
        'Certificate of Good Conduct',
        'One physical family guarantor',
        'Passport photo',
      ],
      highlight: 'With these, you get to start working with a new bike in your possession.',
      extra: 'Agreements and contracts will be given at the office, along with more detailed information.'
    },
    delivery: {
      title: 'Requirements to Join as Delivery Person',
      list: [
        'Own motorcycle (must bring logbook or proof of ownership)',
        'National ID',
        'Valid motorcycle license',
        'Certificate of Good Conduct',
        'Passport photo',
        'Personal phone number',
      ],
      highlight: 'You will be called and must come to the office for final verification and onboarding as a SureBoda delivery person.',
      extra: 'Bring all original documents and your motorcycle for inspection.'
    },
    manage: {
      title: 'Requirements to Give Out Bike for Management',
      list: [
        'National ID',
        'Proof of bike ownership',
        'Bike logbook',
        'Passport photo',
        'Bike insurance certificate',
      ],
      highlight: 'You will be called and must come to the office for contract signing and handover.',
      extra: 'All agreements and terms will be discussed at the office.'
    },
    requestDelivery: {
      title: 'Requirements for Business Delivery Contract',
      list: [
        'Business/Company registration certificate',
        'National ID of business owner/representative',
        'Contact phone number',
        'Email address',
        'Business location/address',
        'Payment of monthly delivery contract fee',
      ],
      highlight: 'You will be called and must come to the office to sign a monthly contract for SureBoda to deliver to your clients.',
      extra: 'Bring all relevant business documents. All terms, fees, and agreements will be discussed and signed at the office.'
    },
    getBike: {
      title: 'Requirements to Get a Bike',
      list: [
        '200 Ksh documentation & desk fee',
        'National ID',
        "Driver's license (specifically for bike)",
        'Certificate of Good Conduct',
        'One physical family guarantor',
        'Passport photo',
      ],
      highlight: 'With these, you get to start working with a new bike in your possession.',
      extra: 'Agreements and contracts will be given at the office, along with more detailed information.'
    },
  };
  const location = useLocation();
  // Set 'apply' (was 'getBike') as the default active tab
  const [tab, setTab] = useState<ApplicationTab>('getBike');

  // Set tab from query param on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && [
      'appointment',
      'delivery',
      'manage',
      'requestDelivery',
      'getBike',
    ].includes(tabParam)) {
      setTab(tabParam as ApplicationTab);
    }
  }, [location.search]);
  const [forms, setForms] = useState<Record<ApplicationTab, any>>(formsInitial);
  const [submitted, setSubmitted] = useState<Partial<Record<ApplicationTab, boolean>>>({});
  const [snackbar, setSnackbar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (_: any, newValue: string) => setTab(newValue as ApplicationTab);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForms({
      ...forms,
      [tab]: { ...forms[tab], [e.target.name]: e.target.value },
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        ...forms[tab],
        type: tab,
        createdAt: serverTimestamp(),
      });
      setSubmitted({ ...submitted, [tab]: true });
      setSnackbar(true);
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleCloseSnackbar = () => setSnackbar(false);

  return (
    <>
      {/* Mobile Drawer for menu (xs/sm only) */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#18191c',
            color: '#fff',
            width: 260,
            pt: 2,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#00c6fb', fontWeight: 800, mb: 0, textAlign: 'left', fontSize: 18 }}>
            Choose the application that best suits your need
          </Typography>
          <IconButton aria-label="close menu" onClick={() => setMobileMenuOpen(false)} sx={{ color: '#fff', ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, pt: 0, pb: 1 }}>
          {applicationTypes.map((type) => (
            <Button
              key={type.key}
              onClick={() => {
                setTab(type.key as ApplicationTab);
                setMobileMenuOpen(false);
              }}
              sx={{
                display: 'block',
                width: '100%',
                color: tab === type.key ? '#00c6fb' : '#fff',
                background: tab === type.key ? 'rgba(0,198,251,0.08)' : 'transparent',
                fontWeight: 700,
                fontSize: 17,
                textAlign: 'left',
                mb: 1,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                textTransform: 'none',
                justifyContent: 'flex-start',
                '&:hover': {
                  background: 'rgba(0,198,251,0.18)',
                  color: '#00c6fb',
                },
              }}
            >
              {type.label}
            </Button>
          ))}
        </Box>
      </Drawer>
    <Box sx={{ color: '#fff', minHeight: '100vh', bgcolor: '#0a0a0a', py: { xs: 4, md: 10 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#ffd600', mb: 2, letterSpacing: 1, textAlign: 'center' }}>
          SureBoda Applications
        </Typography>
        <Typography sx={{ fontSize: 20, color: '#bbb', mb: 4, textAlign: 'center' }}>
          Choose what you want to do and fill the relevant form. Our team will review your application and contact you.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            justifyContent: 'center',
            gap: { xs: 2, md: 4 },
            mb: 6,
          }}
        >
          {/* Hamburger IconButton for mobile */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}>
            <IconButton
              aria-label="open menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: '#00c6fb', fontSize: 32 }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          </Box>
          {/* Sidebar Tabs (hidden on xs/sm) */}
          <Paper
            elevation={2}
            sx={{
              background: 'transparent',
              borderRadius: 4,
              p: 0,
              minWidth: { xs: '100%', md: 220 },
              maxWidth: { xs: '100%', md: 240 },
              mb: { xs: 2, md: 0 },
              mr: 0,
              border: '1.5px solid #333',
              boxShadow: 'none',
              overflow: 'hidden',
              display: { xs: 'none', md: 'flex' },
              flexDirection: { md: 'column' },
              alignItems: { md: 'stretch' },
              justifyContent: 'flex-start',
              width: { md: 'auto' },
            }}
          >
            <Tabs
              orientation={'vertical'}
              value={tab}
              onChange={handleTabChange}
              variant={'standard'}
              sx={{
                width: '100%',
                minWidth: 0,
                borderRadius: 0,
                background: 'transparent',
                boxShadow: 'none',
                alignItems: { md: 'flex-start' },
                justifyContent: { md: 'flex-start' },
                borderRight: { md: 'none' },
                borderBottom: { md: 'none' },
              }}
              TabIndicatorProps={{ style: { background: 'transparent' } }}
            >
              {applicationTypes.map((type, idx) => {
                const borderBottom = idx !== applicationTypes.length - 1 ? { md: '1px solid #333' } : undefined;
                return (
                  <Tab
                    key={type.key}
                    value={type.key}
                    label={type.label}
                    sx={{
                      color: tab === type.key ? '#00c6fb' : '#fff',
                      fontWeight: 700,
                      fontSize: 17,
                      px: 2,
                      py: 2,
                      minHeight: 48,
                      borderRadius: 0,
                      background: {
                        md: tab === type.key ? '#00c6fb' : 'transparent',
                      },
                      boxShadow: 'none',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderBottom: {
                        md: borderBottom?.md || 'none',
                      },
                      borderLeft: {
                        md: '3px solid transparent',
                      },
                      transition: 'background 0.18s, color 0.18s, border-bottom 0.18s',
                      '&:hover': {
                        background: {
                          md: 'rgba(0,198,251,0.12)',
                        },
                        color: '#00c6fb',
                      },
                    }}
                  />
                );
              })}
            </Tabs>
          </Paper>
          {/* Removed blue line separator */}
          {/* Form Card */}
          <Paper
            elevation={6}
            sx={{
              background: '#000',
              borderRadius: 4,
              p: { xs: 2, md: 4 },
              flex: 1,
              minWidth: 0,
              ml: { md: 0, xs: 0 },
              width: { xs: '100%', md: 'auto' },
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
            }}
          >
            {submitted[tab] ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h4" sx={{ color: '#00c6fb', fontWeight: 900, mb: 2 }}>Application Submitted Successfully!</Typography>
                <Typography sx={{ color: '#fff', fontSize: 18, mb: 2 }}>
                  Please wait for our team to call you.<br />
                  <b>Do not apply more than once</b> or your application may be terminated.
                </Typography>
                <Button
                  onClick={() => {
                    setSubmitted({ ...submitted, [tab]: false });
                    setForms((prev) => ({ ...prev, [tab]: formsInitial[tab] }));
                  }}
                  sx={{ mt: 3, background: '#00c6fb', color: '#18191c', fontWeight: 700, borderRadius: 99, px: 4, fontSize: 16, textTransform: 'none', '&:hover': { background: '#ffd600', color: '#18191c' } }}
                >
                  Close
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                {tab === 'appointment' && (
                  <>
                    <TextField label="Full Name" name="name" value={forms.appointment.name} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Phone Number" name="phone" value={forms.appointment.phone} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="National ID Number" name="idNumber" value={forms.appointment.idNumber || ''} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Preferred Date" name="date" type="date" value={forms.appointment.date} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} InputLabelProps={{ shrink: true }} />
                    <TextField label="Preferred Time" name="time" type="time" value={forms.appointment.time} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} InputLabelProps={{ shrink: true }} />
                    <TextField label="Reason for Appointment" name="reason" value={forms.appointment.reason} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                  </>
                )}
                {tab === 'delivery' && (
                  <>
                    <TextField label="Full Name" name="name" value={forms.delivery.name} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Phone Number" name="phone" value={forms.delivery.phone} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="National ID Number" name="idNumber" value={forms.delivery.idNumber || ''} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Email" name="email" value={forms.delivery.email} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Experience (years)" name="experience" value={forms.delivery.experience} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="License Number" name="license" value={forms.delivery.license} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                  </>
                )}
                {tab === 'manage' && (
                  <>
                    <TextField label="Full Name" name="name" value={forms.manage.name} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Phone Number" name="phone" value={forms.manage.phone} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="National ID Number" name="idNumber" value={forms.manage.idNumber || ''} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Email" name="email" value={forms.manage.email} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Bike Model" name="bikeModel" value={forms.manage.bikeModel} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Plate Number" name="plate" value={forms.manage.plate} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Special Terms/Notes" name="terms" value={forms.manage.terms} onChange={handleChange} fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                  </>
                )}
                {tab === 'requestDelivery' && (
                  <>
                    <TextField label="Full Name" name="name" value={forms.requestDelivery.name} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Phone Number" name="phone" value={forms.requestDelivery.phone} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="National ID Number" name="idNumber" value={forms.requestDelivery.idNumber || ''} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Email" name="email" value={forms.requestDelivery.email} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Business/Company Name" name="business" value={forms.requestDelivery.business} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Package Type" name="packageType" value={forms.requestDelivery.packageType} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Delivery Frequency" name="frequency" value={forms.requestDelivery.frequency} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                  </>
                )}
                {tab === 'getBike' && (
                  <>
                    <TextField label="Full Name" name="name" value={forms.getBike.name} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Phone Number" name="phone" value={forms.getBike.phone} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Email" name="email" value={forms.getBike.email} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="National ID Number" name="idNumber" value={forms.getBike.idNumber} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <TextField label="Address" name="address" value={forms.getBike.address} onChange={handleChange} required fullWidth sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }} />
                    <Box sx={{ mb: 3 }}>
                      <label style={{ color: '#bbb', fontWeight: 500, fontSize: 16, marginBottom: 8, display: 'block' }}>Why do you want a bike? *</label>
                      <select
                        name="reason"
                        value={forms.getBike.reason}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: 6,
                          background: '#18191c',
                          color: '#fff',
                          border: '1px solid #333',
                          fontSize: 16,
                          outline: 'none',
                        }}
                      >
                        <option value="">Select reason</option>
                        <option value="boda boda business">Boda boda business</option>
                        <option value="delivery">Delivery</option>
                        <option value="transport">Transport</option>
                        <option value="private">Private</option>
                        <option value="other">Other</option>
                      </select>
                    </Box>
                    {forms.getBike.reason === 'other' && (
                      <TextField
                        label="Please describe your reason"
                        name="otherReason"
                        value={forms.getBike.otherReason}
                        onChange={handleChange}
                        required
                        fullWidth
                        sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }}
                      />
                    )}
                  </>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button type="submit" disabled={submitting} sx={{ background: '#fff', color: '#000', fontWeight: 700, borderRadius: 99, px: 4, fontSize: 16, boxShadow: 'none', textTransform: 'none', '&:hover': { background: '#e0e0e0' } }} variant="contained">
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Box>
              </form>
            )}
          </Paper>
        </Box>
        {/* Dynamic Requirements Card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Paper
            elevation={8}
            sx={{
              background: '#111',
              color: '#fff',
              borderRadius: 4,
              p: { xs: 2, md: 4 },
              maxWidth: 500,
              width: { xs: '100%', sm: 420, md: 500 },
              mx: { xs: 0, sm: 'auto' },
            }}
          >
            <Typography variant="h5" sx={{ color: '#ffd600', fontWeight: 800, mb: 2, textAlign: 'center' }}>
              {requirementsContent[tab].title}
            </Typography>
            <Typography sx={{ fontSize: 16, mb: 2, color: '#fff', textAlign: 'center' }}>
              You will be called and must come to the office. Please bring the following:
            </Typography>
            <ul style={{ color: '#fff', fontSize: 15, marginLeft: 18, marginBottom: 18 }}>
              {requirementsContent[tab].list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            {requirementsContent[tab].highlight && (
              <Typography sx={{ fontSize: 15, color: '#ffd600', fontWeight: 600, textAlign: 'center', mb: 1 }}>
                {requirementsContent[tab].highlight}
              </Typography>
            )}
            {requirementsContent[tab].extra && (
              <Typography sx={{ fontSize: 14, color: '#00c6fb', textAlign: 'center' }}>
                {requirementsContent[tab].extra}
              </Typography>
            )}
          </Paper>
        </Box>
        {/* Removed auto-hide, now handled by Close button above */}
      </Container>
    </Box>
    </>
  );
};

export default GetBike;
