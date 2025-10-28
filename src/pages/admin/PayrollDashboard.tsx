import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from '@mui/material';
import { collection, getDocs, doc, setDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firestore';

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

export default function PayrollDashboard() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PayrollEntry | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDocs(collection(db, 'payroll')).then(snap => {
      setPayroll(snap.docs.map(d => d.data() as PayrollEntry));
      setLoading(false);
    });
  }, [addLoading]);

  const handleView = async (entry: PayrollEntry) => {
    setSelected(entry);
    setTxLoading(true);
    setOpen(true);
    const txSnap = await getDocs(query(collection(db, 'payroll', entry.userId, 'transactions'), orderBy('date', 'desc')));
    setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
    setTxLoading(false);
  };

  const handleAddTx = async () => {
    if (!selected || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setAddLoading(true);
    await addDoc(collection(db, 'payroll', selected.userId, 'transactions'), {
      amount: Number(amount),
      date: new Date(),
      description: desc || 'Daily Target Fee',
    });
    setAmount('');
    setDesc('');
    handleView(selected); // Refresh
    setAddLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: '#4FC3F7' }}>Payroll Dashboard</Typography>
      {loading ? <CircularProgress /> : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', background: '#1e1e1e' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: '#23272b' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Rider</TableCell>
                  <TableCell sx={{ color: 'white' }}>Daily Target Fee</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payroll.map(entry => (
                  <TableRow key={entry.userId}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>{entry.fullName}</TableCell>
                    <TableCell sx={{ color: '#00c6fb', fontWeight: 700 }}>KES {entry.dailyTargetFee}</TableCell>
                    <TableCell>
                      <Button variant="contained" sx={{ bgcolor: '#4FC3F7', color: '#18191c', fontWeight: 700 }} onClick={() => handleView(entry)}>View Transactions</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transactions for {selected?.fullName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} sx={{ mr: 2 }} />
            <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} sx={{ mr: 2 }} />
            <Button variant="contained" onClick={handleAddTx} disabled={addLoading} sx={{ bgcolor: '#4FC3F7', color: '#18191c', fontWeight: 700 }}>Add Payment</Button>
          </Box>
          {txLoading ? <CircularProgress /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.date?.toDate ? tx.date.toDate().toLocaleString() : new Date(tx.date).toLocaleString()}</TableCell>
                      <TableCell><Chip label={`KES ${tx.amount}`} color="success" /></TableCell>
                      <TableCell>{tx.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ bgcolor: '#FFA726', color: '#18191c', fontWeight: 700, '&:hover': { bgcolor: '#FB8C00', color: '#fff' } }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
