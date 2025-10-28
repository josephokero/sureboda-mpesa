import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, TextField } from '@mui/material';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firestore';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface PayrollEntry {
  userId: string;
  fullName: string;
  dailyTargetFee: number;
}

interface Transaction {
  id: string;
  amount: number;
  date: any;
  description: string;
}

const MotionTableRow = motion(TableRow);

export default function PayrollListSection() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PayrollEntry | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<PayrollEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'payroll')).then(snap => {
      setPayroll(snap.docs.map(d => d.data() as PayrollEntry));
      setLoading(false);
    });
  }, []);

  const handleView = async (entry: PayrollEntry) => {
    setSelected(entry);
    setTxLoading(true);
    setOpen(true);
    const txSnap = await getDocs(query(collection(db, 'payroll', entry.userId, 'transactions'), orderBy('date', 'desc')));
    setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
    setTxLoading(false);
  };

  const openRemoveConfirmation = (entry: PayrollEntry) => {
    setUserToRemove(entry);
    setOpenRemoveDialog(true);
  };

  const handleRemove = async () => {
    if (!userToRemove) return;
    await deleteDoc(doc(db, 'payroll', userToRemove.userId));
    setPayroll(payroll.filter(p => p.userId !== userToRemove.userId));
    setOpenRemoveDialog(false);
    setUserToRemove(null);
  };

  const filteredPayroll = payroll.filter(entry =>
    entry.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  let todayTotal = 0;
  let dailyTarget = selected?.dailyTargetFee || 820;
  if (selected && transactions.length > 0) {
    const today = new Date();
    today.setHours(0,0,0,0);
    todayTotal = transactions
      .filter(tx => {
        const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
        return txDate >= today && txDate < new Date(today.getTime() + 24*60*60*1000);
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  }
  const cleared = todayTotal >= dailyTarget;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Riders in Payroll</Typography>
      <Box sx={{ p: 2 }}>
        <TextField
          label="Search by Name"
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
      </Box>
      {loading ? <CircularProgress /> : (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#1E1E1E' }}>
          <TableContainer>
            <Table sx={{ borderCollapse: 'collapse' }}>
              <TableHead sx={{ backgroundColor: '#000000' }}>
                <TableRow>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Rider</TableCell>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Daily Target Fee</TableCell>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayroll.map((entry, i) => (
                  <MotionTableRow
                    key={entry.userId}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: '#2a2a2a' }, '&:hover': { backgroundColor: '#3a3a3a' } }}
                  >
                    <TableCell sx={{ border: '1px solid #007bff', color: 'white' }}>{entry.fullName}</TableCell>
                    <TableCell sx={{ border: '1px solid #007bff', color: '#00c6fb', fontWeight: 'bold' }}>KES {entry.dailyTargetFee}</TableCell>
                    <TableCell sx={{ border: '1px solid #007bff' }}>
                      <Button variant="contained" startIcon={<VisibilityIcon />} sx={{ background: 'linear-gradient(45deg, #4FC3F7 30%, #00C6FB 90%)', color: 'white', fontWeight: 700, mr: 1 }} onClick={() => handleView(entry)}>View</Button>
                      <IconButton onClick={() => openRemoveConfirmation(entry)} sx={{ color: '#f44336' }}><DeleteIcon /></IconButton>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Transactions for {selected?.fullName}
          {selected && (
            <Chip
              label={cleared ? 'Cleared' : 'Not Cleared'}
              color={cleared ? 'success' : 'error'}
              sx={{ fontWeight: 700, fontSize: 16, ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>
              Today's Total: <span style={{ color: cleared ? 'green' : 'orange', fontWeight: 900 }}>KES {todayTotal}</span> / KES {dailyTarget}
            </Typography>
          </Box>
          {txLoading ? <CircularProgress /> : (
            <TableContainer component={Paper} sx={{ borderRadius: 2, backgroundColor: '#1E1E1E', border: '1px solid #007bff' }}>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableHead sx={{ backgroundColor: '#000000' }}>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Date</TableCell>
                    <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Amount</TableCell>
                    <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx, i) => {
                    const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
                    const isToday = (() => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return txDate >= today && txDate < new Date(today.getTime() + 24*60*60*1000);
                    })();
                    return (
                      <MotionTableRow key={tx.id} custom={i} initial="hidden" animate="visible" variants={rowVariants} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#2a2a2a' }, '&:hover': { backgroundColor: '#3a3a3a' } }}>
                        <TableCell sx={{ border: '1px solid #007bff', fontWeight: isToday ? 700 : 400, color: isToday ? '#4FC3F7' : 'white' }}>{txDate.toLocaleString()}</TableCell>
                        <TableCell sx={{ border: '1px solid #007bff', color: 'white' }}><Chip label={`KES ${tx.amount}`} color={isToday ? 'primary' : 'default'} sx={{ backgroundColor: isToday ? '#4FC3F7' : '#555', color: 'white' }} /></TableCell>
                        <TableCell sx={{ border: '1px solid #007bff', color: 'white' }}>{tx.description}</TableCell>
                      </MotionTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Remove Rider from Payroll</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove <b>{userToRemove?.fullName}</b> from the payroll?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
          <Button onClick={handleRemove} color="error">Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
