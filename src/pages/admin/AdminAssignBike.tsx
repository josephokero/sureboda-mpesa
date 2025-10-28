import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firestore';

export default function AdminAssignBike() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [bike, setBike] = useState({ model: '', plateNumber: '', status: 'Active', contractType: 'SureBoda', vehicleModel: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'users'))
      .then(snapshot => setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    if (!selectedUser || !bike.model || !bike.plateNumber) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      // Use a unique docId for each assignment (e.g., plateNumber or a random id)
      const docId = bike.plateNumber.replace(/\s+/g, '_').toUpperCase();
      await setDoc(doc(db, 'users', selectedUser, 'assignedBike', docId), bike);
      setSuccess(true);
      setError(null);
      // Reset form after success
      setBike({ model: '', plateNumber: '', status: 'Active', contractType: 'SureBoda', vehicleModel: '' });
      setSelectedUser('');
    } catch (err: any) {
      setError(err.message || 'Failed to assign bike');
    }
    setLoading(false);
  };

    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 540 }}>
          {loading ? (
            <CircularProgress color="primary" />
          ) : (
            <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 500, background: '#000', mx: 'auto' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>User</InputLabel>
                <Select value={selectedUser} label="User" onChange={e => setSelectedUser(e.target.value)}>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>{user.fullName} ({user.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel shrink>Bike Model</InputLabel>
                <input
                  type="text"
                  value={bike.model}
                  onChange={e => setBike({ ...bike, model: e.target.value })}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 8, background: '#000', color: '#fff' }}
                  placeholder="e.g. Spiro Ekon 450"
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel shrink>Vehicle Model</InputLabel>
                <input
                  type="text"
                  value={bike.vehicleModel}
                  onChange={e => setBike({ ...bike, vehicleModel: e.target.value })}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 8, background: '#000', color: '#fff' }}
                  placeholder="e.g. 2023"
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select value={bike.status} label="Status" onChange={e => setBike({ ...bike, status: e.target.value })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Contract Type</InputLabel>
                <Select value={bike.contractType} label="Contract Type" onChange={e => setBike({ ...bike, contractType: e.target.value })}>
                  <MenuItem value="SureBoda">SureBoda</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel shrink>Plate Number</InputLabel>
                <input type="text" value={bike.plateNumber} onChange={e => setBike({ ...bike, plateNumber: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 8, background: '#000', color: '#fff' }} placeholder="e.g. KMFD 123X" />
              </FormControl>
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleAssign} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Bike'}
              </Button>
            </Paper>
          )}
          <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
              Bike assigned successfully!
            </Alert>
          </Snackbar>
          <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    );
}
