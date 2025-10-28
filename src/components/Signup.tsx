
import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Stack, ToggleButton, ToggleButtonGroup, Checkbox, FormControlLabel, InputAdornment, IconButton, Alert, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firestore';

const roleOptions = [
  { value: 'Rider', label: 'Rider', description: 'Rider: Join as a professional rider to access a fleet of well-maintained bikes and earn income by meeting daily targets.' },
  { value: 'Client', label: 'Client', description: 'Client: Partner with us to have your bikes managed by our team, ensuring reliable drivers and consistent daily earnings.' },
  { value: 'Investor', label: 'Investor/Shares', description: 'Investor/Shares is for those who want to invest in the business and earn returns.' }
];

export default function Signup() {
  // Removed step logic for direct signup
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [agree, setAgree] = useState(false);
  const [role, setRole] = useState('Rider');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePhone = (num: string) => {
    return /^0[17]\d{8}$/.test(num);
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name as it appears on your ID');
      return;
    }
    if (!idNumber.trim()) {
      setError('Please enter your identification card number');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Phone number must be 10 digits and start with 01 or 07');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Debug log user object and Firestore data
      console.log('Firebase Auth user:', user);
      const userData = {
        fullName,
        idNumber,
        email: user.email,
        phone,
        location,
        role,
        createdAt: new Date().toISOString(),
        uid: user.uid
      };
      console.log('Firestore user data:', userData);
      // Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 30%, #2a2a2a 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={12} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {success ? (
            <Stack spacing={3} alignItems="center">
              <Alert severity="success" sx={{ width: '100%', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>Account created successfully!</Alert>
              <Button
                variant="contained"
                size="large"
                sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, #0078ff, #00c6fb)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg, #005bb5, #00a4d4)' }, minWidth: 180 }}
                href="/login"
              >
                Go to Login
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSignup}>
              <Stack spacing={3}>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, textAlign: 'center', mb: 2, textShadow: '0 0 10px rgba(0, 198, 251, 0.5)' }}>
                  Create Your Account
                </Typography>
                {error && <Alert severity="error" sx={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>{error}</Alert>}
                <Box component="div" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Full Name (as on ID)</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your full name as it appears on your ID"
                      type="text"
                      variant="filled"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                    />
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>ID Card Number</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your identification card number"
                      type="text"
                      variant="filled"
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                    />
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Email</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your email"
                      type="email"
                      variant="filled"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, 'label': {color: '#fff'}, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                    />
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Phone Number</Typography>
                    <TextField
                      fullWidth
                      placeholder="01xxxxxxxx or 07xxxxxxxx"
                      type="tel"
                      variant="filled"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                      inputProps={{ maxLength: 10 }}
                    />
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Location</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your location"
                      type="text"
                      variant="filled"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Password</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      variant="filled"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((show) => !show)}
                              edge="end"
                              sx={{ color: '#00c6fb' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Confirm Password</Typography>
                    <TextField
                      fullWidth
                      placeholder="Confirm your password"
                      type={showPassword ? 'text' : 'password'}
                      variant="filled"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                    />
                    <Typography sx={{ color: '#ccc', fontWeight: 600, mb: 1, ml: 0.5, fontSize: '0.9rem' }}>Who's joining us?</Typography>
                    <TextField
                      select
                      fullWidth
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      SelectProps={{ native: true }}
                      variant="filled"
                      sx={{ mb: 1, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }, 'svg': {color: '#fff'} }}
                    >
                      {roleOptions.map(opt => (
                        <option style={{backgroundColor: '#1e1e1e'}} key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </TextField>
                    <Typography sx={{ color: '#00c6fb', fontSize: '0.85rem', mt: 1, mb: 2, minHeight: '3.5em' }}>
                      {roleOptions.find(opt => opt.value === role)?.description}
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={<Checkbox checked={agree} onChange={e => setAgree(e.target.checked)} sx={{ color: '#00c6fb', '&.Mui-checked': {color: '#00c6fb'} }} />}
                  label={
                    <Typography sx={{ color: '#ccc', fontSize: '0.9rem' }}>
                      I agree to the{' '}
                      <a href="/terms-of-service" style={{ color: '#00c6fb', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">terms</a>{' '}and{' '}
                      <a href="/privacy-policy" style={{ color: '#00c6fb', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">privacy policy</a>
                      .
                    </Typography>
                  }
                  sx={{ mb: 2, ml: 0.5 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, #0078ff, #00c6fb)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg, #005bb5, #00a4d4)' } }}
                  disabled={!fullName.trim() || !idNumber.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim() || !location.trim() || !agree || loading}
                  type="submit"
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  href="/login"
                  sx={{ mt: 2, fontWeight: 700, borderRadius: 2, borderColor: '#00c6fb', color: '#00c6fb', background: 'rgba(0,0,0,0.5)', '&:hover': { background: 'rgba(0,198,251,0.1)', borderColor: '#00c6fb' } }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
