
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import { db } from '../../firestore';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';


interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  active: boolean;
}

export default function AddToPayrollSection({ users, onUserAdded }: { users: User[]; onUserAdded: () => void }) {
  const [filter, setFilter] = useState<'all' | 'on' | 'off'>('all');
  const handleFilterChange = (_: any, newFilter: 'all' | 'on' | 'off') => {
    if (newFilter !== null) setFilter(newFilter);
  };
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fee, setFee] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [payrollUserIds, setPayrollUserIds] = useState<string[]>([]);
  const [loadingPayroll, setLoadingPayroll] = useState(true);

  useEffect(() => {
    setLoadingPayroll(true);
    getDocs(collection(db, 'payroll')).then(snap => {
      setPayrollUserIds(snap.docs.map(d => d.id));
      setLoadingPayroll(false);
    });
  }, [adding, removing]);

  let filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (filter === 'on') {
    filteredUsers = filteredUsers.filter(u => payrollUserIds.includes(u.id));
  } else if (filter === 'off') {
    filteredUsers = filteredUsers.filter(u => !payrollUserIds.includes(u.id));
  }

  const handleOpen = (user: User) => {
    setSelectedUser(user);
    setFee('');
    setError('');
    setOpen(true);
  };

  const handleAdd = async () => {
    if (!selectedUser || !fee || isNaN(Number(fee)) || Number(fee) <= 0) {
      setError('Enter a valid daily target fee');
      return;
    }
    setAdding(true);
    try {
      // Generate a random 4-digit riderId
      const riderId = Math.floor(1000 + Math.random() * 9000).toString();
      await setDoc(doc(db, 'payroll', selectedUser.id), {
        userId: selectedUser.id,
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        phone: selectedUser.phone,
        riderId,
        dailyTargetFee: Number(fee),
        balance: 0,
        payrollJoinTime: new Date(),
      });
      setOpen(false);
      setFee('');
      setSelectedUser(null);
      onUserAdded();
    } catch (e) {
      setError('Failed to add to payroll');
    }
    setAdding(false);
  };

  const handleRemove = async (user: User) => {
    setRemoving(true);
    try {
      await deleteDoc(doc(db, 'payroll', user.id));
      onUserAdded();
    } catch (e) {
      // handle error
    }
    setRemoving(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Add Users to Payroll</Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search Riders"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputLabelProps={{
            sx: {
              color: 'gray',
              '&.Mui-focused': {
                color: '#007bff',
              },
            },
          }}
          sx={{
            mb: 2,
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#007bff' },
              '&:hover fieldset': { borderColor: '#007bff' },
              '&.Mui-focused fieldset': { borderColor: '#007bff' },
            },
          }}
        />
        <FormControl sx={{ minWidth: 160, mb: 2 }} size="small">
          <InputLabel id="filter-by-label" sx={{ color: 'gray', '&.Mui-focused': { color: '#007bff' } }}>Filter by</InputLabel>
          <Select
            labelId="filter-by-label"
            id="filter-by"
            value={filter}
            label="Filter by"
            onChange={e => setFilter(e.target.value as 'all' | 'on' | 'off')}
            sx={{
              color: 'white',
              background: '#23272b',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#007bff' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007bff' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007bff' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#23272b',
                  color: 'white',
                },
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="on">On Payroll</MenuItem>
            <MenuItem value="off">Not on Payroll</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper} sx={{ backgroundColor: '#18191c' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#23272b' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Phone</TableCell>
              <TableCell sx={{ color: 'white' }}>Location</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => {
              const onPayroll = payrollUserIds.includes(user.id);
              return (
                <TableRow key={user.id}>
                  <TableCell sx={{ color: 'white' }}>{user.fullName}</TableCell>
                  <TableCell sx={{ color: '#a9a9a9' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: '#a9a9a9' }}>{user.phone}</TableCell>
                  <TableCell sx={{ color: '#a9a9a9' }}>{user.location}</TableCell>
                  <TableCell>
                    {onPayroll ? (
                      <Button
                        variant="outlined"
                        color="success"
                        sx={{ fontWeight: 700, color: '#43e97b', borderColor: '#43e97b', '&:hover': { bgcolor: '#23272b', borderColor: '#43e97b' } }}
                        onClick={() => handleRemove(user)}
                        disabled={removing}
                      >
                        {removing ? <CircularProgress size={20} /> : 'On Payroll (Remove?)'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleOpen(user)}
                        sx={{ bgcolor: '#007bff', color: 'white', fontWeight: 700 }}
                      >
                        Add to Payroll
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add {selectedUser?.fullName} to Payroll</DialogTitle>
        <DialogContent>
          <TextField
            label="Daily Target Fee"
            type="number"
            value={fee}
            onChange={e => setFee(e.target.value)}
            fullWidth
            sx={{ mt: 2,
              '& label.Mui-focused': {
                color: '#007bff',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#007bff',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#007bff',
                },
              },
            }}
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="primary" disabled={adding}>
            {adding ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
