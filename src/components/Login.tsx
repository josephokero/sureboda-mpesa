
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Paper, Stack, IconButton, InputAdornment, Checkbox, FormControlLabel, Alert, CircularProgress, Link, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firestore';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  'Rider',
  'Delivery Rider',
  'Bike Owner',
  'Business Delivery Partner',
];

const stepVariants = {
  hidden: { opacity: 0, x: 300 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -300 },
};

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Fetch user doc from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;
      if (!userData || userData.active !== true) {
        setError('Your account is not active. Please contact support to activate your account.');
        setLoading(false);
        return;
      }
      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'Rider') {
        navigate('/rider-dashboard/overview');
      } else if (role === 'Client') {
        // Add client dashboard navigation if exists
        navigate('/client-dashboard');
      } else if (role === 'Investor/Shares') {
        // Add investor dashboard navigation if exists
        navigate('/investor-dashboard');
      } else {
        setError('You are not authorized for this dashboard.');
      }
    } catch (err: any) {
      // Firebase error codes: https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      let msg = 'Login failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Wrong email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (err.code === 'auth/user-disabled') {
        msg = 'Your account has been disabled. Contact support.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 30%, #2a2a2a 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Go Home button always visible */}
      <Button
        variant="outlined"
        color="primary"
        href="/"
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 32 },
          left: { xs: 16, sm: 32 },
          zIndex: 10,
          fontWeight: 700,
          borderRadius: 2,
          borderColor: '#00c6fb',
          color: '#00c6fb',
          background: 'rgba(0,0,0,0.5)',
          '&:hover': { background: 'rgba(0,198,251,0.1)', borderColor: '#00c6fb' }
        }}
      >
        Go Home
      </Button>
      <Container maxWidth="xs">
        <Paper elevation={12} sx={{ p: 4, borderRadius: 4, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', minHeight: '450px' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key={1} initial="hidden" animate="visible" exit="exit" variants={stepVariants} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <Stack spacing={3} sx={{position: 'absolute', width: 'calc(100% - 64px)'}}>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, textAlign: 'center', textShadow: '0 0 10px rgba(0, 198, 251, 0.5)' }}>
                    Who wants to join us?
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your name..."
                    variant="filled"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{ input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, #0078ff, #00c6fb)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg, #005bb5, #00a4d4)' } }}
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </Stack>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key={2} initial="hidden" animate="visible" exit="exit" variants={stepVariants} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <Stack spacing={3} sx={{position: 'absolute', width: 'calc(100% - 64px)'}}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => setStep(1)} sx={{ color: '#00c6fb', mr: 1 }}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, textAlign: 'center', flex: 1 }}>
                      Hi {name}, what best describes you?
                    </Typography>
                  </Box>
                  <ToggleButtonGroup
                    orientation="vertical"
                    exclusive
                    value={role}
                    onChange={(_, value) => setRole(value)}
                    sx={{ gap: 1.5, width: '100%' }}
                  >
                    {roles.map(r => (
                      <ToggleButton key={r} value={r} sx={{ color: '#fff', borderColor: 'rgba(0, 198, 251, 0.5)', fontWeight: 600, py: 1.5, borderRadius: 2, textTransform: 'none', background: role === r ? 'linear-gradient(90deg,#0078ff,#00c6fb)' : 'rgba(255, 255, 255, 0.05)', '&.Mui-selected': { color: '#fff', background: 'linear-gradient(90deg,#0078ff,#00c6fb)' }, '&:hover': { background: role !== r ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(90deg, #005bb5, #00a4d4)' } }}>
                        {r}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, #0078ff, #00c6fb)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg, #005bb5, #00a4d4)' } }}
                    disabled={!role}
                    onClick={() => setStep(3)}
                  >
                    Next
                  </Button>
                </Stack>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key={3} initial="hidden" animate="visible" exit="exit" variants={stepVariants} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <form onSubmit={handleLogin} style={{position: 'absolute', width: 'calc(100% - 64px)'}}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => setStep(2)} sx={{ color: '#00c6fb', mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, textAlign: 'center', flex: 1, textShadow: '0 0 10px rgba(0, 198, 251, 0.5)' }}>
                            Login to your account
                        </Typography>
                    </Box>
                    {error && <Alert severity="error" sx={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>{error}</Alert>}
                    <TextField
                      fullWidth
                      placeholder="Enter your email"
                      type="email"
                      variant="filled"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      sx={{ input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
                    />
                    <TextField
                      fullWidth
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      variant="filled"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      sx={{ input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 } }}
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <FormControlLabel
                        control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} sx={{ color: '#00c6fb', '&.Mui-checked': {color: '#00c6fb'} }} />}
                        label={<Typography sx={{ color: '#ccc', fontSize: '0.9rem' }}>Remember me</Typography>}
                      />
                      <Link href="#" sx={{ color: '#00c6fb', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Forgot password?
                      </Link>
                    </Stack>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, #0078ff, #00c6fb)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg, #005bb5, #00a4d4)' } }}
                      disabled={!email.trim() || !password.trim() || loading}
                      type="submit"
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                    <Typography sx={{ color: '#ccc', textAlign: 'center', mt: 2 }}>
                      Don't have an account?{' '}
                      <Link href="/signup" sx={{ color: '#00c6fb', textDecoration: 'none' }}>
                        Sign up
                      </Link>
                    </Typography>
                  </Stack>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </Box>
  );
}
