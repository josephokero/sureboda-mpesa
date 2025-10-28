

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Alert, IconButton, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../../firestore';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const AssignedBike = () => {
  const [bike, setBike] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialog, setDialog] = useState<null | 'service' | 'issue' | 'return'>(null);
  const [form, setForm] = useState({
    serviceReason: '',
    issueTitle: '',
    issueDescription: '',
    returnReason: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setBike(null);
        setLoading(false);
        return;
      }
      try {
        const assignedBikeDoc = await getDoc(doc(db, 'users', firebaseUser.uid, 'assignedBike', 'main'));
        if (assignedBikeDoc.exists()) {
          setBike(assignedBikeDoc.data());
        } else {
          setBike(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch assigned bike');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpen = (type: 'service' | 'issue' | 'return') => {
    setDialog(type);
    setForm({ serviceReason: '', issueTitle: '', issueDescription: '', returnReason: '' });
    setSubmitted(false);
    setSuccessOpen(false);
  };
  const handleClose = () => setDialog(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');
      if (!bike) throw new Error('No assigned bike');
      let data: any = { createdAt: serverTimestamp() };
      let subcollection = '';
      if (dialog === 'service') {
        subcollection = 'serviceRequests';
        data.reason = form.serviceReason;
        data.bikeModel = bike.model;
        data.plateNumber = bike.plateNumber;
      } else if (dialog === 'issue') {
        subcollection = 'issues';
        data.title = form.issueTitle;
        data.description = form.issueDescription;
        data.bikeModel = bike.model;
        data.plateNumber = bike.plateNumber;
      } else if (dialog === 'return') {
        subcollection = 'returnRequests';
        data.reason = form.returnReason;
        data.bikeModel = bike.model;
        data.plateNumber = bike.plateNumber;
      }
      await addDoc(collection(db, 'users', user.uid, subcollection), data);
      setSubmitted(true);
      setSuccessOpen(true);
    } catch (err) {
      alert('Failed to submit: ' + (err as any).message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff', mb: 3 }}>
        Assigned Bike
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : !bike ? (
        <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>
            You have not been assigned a bike yet.<br />
            Please wait for the admin to assign you a bike.
          </Typography>
        </Paper>
      ) : (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: '16px', 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 260 }}>
              <motion.img 
                src={bike.imageUrl || '/boxer.avif'} 
                alt={bike.model || 'Bike'} 
                style={{ width: '100%', borderRadius: '12px' }} 
                whileHover={{ scale: 1.05 }}
              />
            </Box>
            <Box sx={{ flex: '2 1 400px', minWidth: 320 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {bike.model}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#ccc' }}>
                Plate Number: <strong>{bike.plateNumber}</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Status: <span style={{ color: bike.status === 'Active' ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{bike.status}</span>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Contract Type: <strong>
                  <span style={{ color: '#fff' }}>Sure</span>
                  <span style={{ color: '#00c6fb' }}>Boda</span>
                </strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Vehicle Model: <strong>{bike.vehicleModel}</strong>
              </Typography>
              <Box>
                <Button variant="contained" color="primary" sx={{ mr: 2, fontWeight: 700 }} onClick={() => handleOpen('service')}>
                  Request Service
                </Button>
                <Button variant="outlined" color="secondary" sx={{ mr: 2, fontWeight: 700 }} onClick={() => handleOpen('issue')}>
                  Report Issue
                </Button>
                <Button variant="contained" color="warning" sx={{ fontWeight: 700 }} onClick={() => handleOpen('return')}>
                  Return Bike
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

  {/* Dialogs for each action */}
      <Dialog open={dialog === 'service'} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, background: 'rgba(0,0,0,0.95)', color: '#fff', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#00c6fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Request Service
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, background: 'rgba(0,198,251,0.08)', color: '#00c6fb', fontWeight: 600, border: '1px solid #00c6fb' }}>
            <strong>Note:</strong> You will receive a response within 1-2 business days. Please explain your service request clearly and in detail to help us assist you efficiently.
          </Alert>
          {submitted ? (
            <Alert
              severity="success"
              sx={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', fontWeight: 700, position: 'relative', pr: 6 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => { setDialog(null); setSuccessOpen(false); }}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Service request submitted!<br />
              We have received your message and we will get back to you soon.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Reason for Service"
                  name="serviceReason"
                  value={form.serviceReason}
                  onChange={handleChange}
                  required
                  multiline
                  minRows={2}
                  variant="filled"
                  placeholder="Describe the issue or maintenance needed. Be as specific as possible."
                  sx={{ input: { color: '#fff' }, textarea: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                  fullWidth
                />
                <DialogActions>
                  <Button onClick={handleClose} color="secondary" variant="outlined">Cancel</Button>
                  <Button type="submit" color="primary" variant="contained" sx={{ fontWeight: 700 }}>Submit</Button>
                </DialogActions>
              </Stack>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'issue'} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, background: 'rgba(0,0,0,0.95)', color: '#fff', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#bfa046', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Report Issue
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, background: 'rgba(191,160,70,0.08)', color: '#bfa046', fontWeight: 600, border: '1px solid #bfa046' }}>
            <strong>Note:</strong> You will receive a response within 1-2 business days. Please explain your issue clearly and in detail so we can resolve it quickly and effectively.
          </Alert>
          {submitted ? (
            <Alert
              severity="success"
              sx={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', fontWeight: 700, position: 'relative', pr: 6 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => { setDialog(null); setSuccessOpen(false); }}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Issue reported successfully!<br />
              We have received your message and we will get back to you soon.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Issue Title"
                  name="issueTitle"
                  value={form.issueTitle}
                  onChange={handleChange}
                  required
                  variant="filled"
                  placeholder="Summarize the problem (e.g. 'Engine noise', 'Brake failure')"
                  sx={{ input: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                  fullWidth
                />
                <TextField
                  label="Description"
                  name="issueDescription"
                  value={form.issueDescription}
                  onChange={handleChange}
                  required
                  multiline
                  minRows={3}
                  variant="filled"
                  placeholder="Describe the issue in detail. Include when it started, any sounds, lights, or changes in performance."
                  sx={{ input: { color: '#fff' }, textarea: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                  fullWidth
                />
                <DialogActions>
                  <Button onClick={handleClose} color="secondary" variant="outlined">Cancel</Button>
                  <Button type="submit" color="primary" variant="contained" sx={{ fontWeight: 700 }}>Submit</Button>
                </DialogActions>
              </Stack>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'return'} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, background: 'rgba(0,0,0,0.95)', color: '#fff', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Return Bike
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, background: 'rgba(255,152,0,0.08)', color: '#ff9800', fontWeight: 600, border: '1px solid #ff9800' }}>
            <strong>Note:</strong> You will receive a response within 1-2 business days. Please explain your reason for returning the bike clearly and in detail.
          </Alert>
          {submitted ? (
            <Alert
              severity="success"
              sx={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', fontWeight: 700, position: 'relative', pr: 6 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => { setDialog(null); setSuccessOpen(false); }}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Return request submitted!<br />
              We have received your message and we will get back to you soon.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Reason for Returning Bike"
                  name="returnReason"
                  value={form.returnReason}
                  onChange={handleChange}
                  required
                  multiline
                  minRows={2}
                  variant="filled"
                  placeholder="Explain why you wish to return the bike. Be as clear and detailed as possible."
                  sx={{ input: { color: '#fff' }, textarea: { color: '#fff' }, '.MuiFilledInput-root': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 } }}
                  fullWidth
                />
                <DialogActions>
                  <Button onClick={handleClose} color="secondary" variant="outlined">Cancel</Button>
                  <Button type="submit" color="warning" variant="contained" sx={{ fontWeight: 700 }}>Submit</Button>
                </DialogActions>
              </Stack>
            </form>
          )}
        </DialogContent>
      </Dialog>
  {/* Professional reminder card below the main section */}
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={6} sx={{
          p: 3,
          maxWidth: 600,
          width: '100%',
          background: 'linear-gradient(90deg, #181818 60%, #00c6fb22 100%)',
          borderRadius: 4,
          border: '1px solid #00c6fb44',
          color: '#fff',
          boxShadow: '0 4px 24px 0 rgba(0,198,251,0.08)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#00c6fb', mb: 1 }}>
            Important Maintenance Reminder
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '1.08rem', fontWeight: 500 }}>
            Please ensure you return your bike to the <span style={{ color: '#00c6fb', fontWeight: 700 }}>SureBoda Garage Department</span> for screening every <span style={{ color: '#bfa046', fontWeight: 700 }}>2 weeks</span> or as per your agreed schedule. <br /><br />
            <span style={{ color: '#ff9800', fontWeight: 700 }}>Failure to comply may result in the bike being repossessed.</span>
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default AssignedBike;
