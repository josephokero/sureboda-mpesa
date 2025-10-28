import React, { useState, useEffect } from 'react';
import { useAppSettings } from '../../AppSettingsContext';
import { Box, Paper, Typography, Switch, FormControlLabel, Divider, TextField, Button, Avatar, Stack, Snackbar, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firestore';


const Settings = () => {
  const { notifications, setNotifications } = useAppSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const auth = getAuth();
    let unsubscribe: (() => void) | undefined;
    unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.fullName || '');
          setEmail(data.email || '');
        } else {
          setError('User data not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('User not logged in');
        setSaving(false);
        return;
      }
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: name,
        email
      });
      setOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00c6fb', mb: 3, fontWeight: 'bold' }}>
        Settings
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#fff', maxWidth: 800 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
            {/* Profile Section */}
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00c6fb', fontWeight: 700 }}>Profile</Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, fontSize: 32 }}>{name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U'}</Avatar>
                <Box>
                  <TextField
                    label="Full Name (as on ID)"
                    variant="filled"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{ mb: 2, input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    variant="filled"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                    fullWidth
                  />
                </Box>
              </Stack>
              <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 1, fontWeight: 700 }} disabled={saving}>
                {saving ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2, background: '#222' }} />
            {/* Preferences Section */}
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00c6fb', fontWeight: 700 }}>Preferences</Typography>
              <FormControlLabel
                control={<Switch color="primary" checked={notifications} onChange={e => setNotifications(e.target.checked)} />}
                label="Enable Notifications"
                sx={{ mb: 2 }}
              />
            </Box>
          </Stack>
          <Divider sx={{ my: 4, background: '#222' }} />
          {/* Account Actions */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#00c6fb', fontWeight: 700 }}>Account</Typography>
            <Button variant="outlined" color="error" sx={{ fontWeight: 700 }}>
              Change Password
            </Button>
          </Box>
        </Paper>
      )}
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Settings;
