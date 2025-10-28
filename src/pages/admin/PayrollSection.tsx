import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { collection, getDocs, setDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firestore';
import { motion } from 'framer-motion';
import AddCircleIcon from '@mui/icons-material/AddCircle';


interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  active: boolean;
}

interface PayrollEntry {
  id: string;
  userId: string;
  fullName: string;
  dailyTargetFee: number;
  balance: number;
  payrollJoinTime?: any; // Firestore Timestamp, string, or Date
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  date: any;
  description: string;
}

const MotionTableRow = motion(TableRow);

export default function PayrollSection({ users, onUserAdded }: { users: User[]; onUserAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fee, setFee] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [payrollUsers, setPayrollUsers] = useState<string[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<{
    totalBalance: number;
    totalPaid: number;
    totalTransactions: number;
    recentActivity: Transaction[];
  }>({
    totalBalance: 0,
    totalPaid: 0,
    totalTransactions: 0,
    recentActivity: [],
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoadingStats(true);
    getDocs(collection(db, 'payroll')).then(async snap => {
      const entries = snap.docs.map(d => ({ id: d.id, ...d.data() })) as PayrollEntry[];
      setPayrollUsers(entries.map(e => e.id));
      setPayrollEntries(entries);
      // Fetch all transactions for all payroll users
      let allTx: Transaction[] = [];
      for (const entry of entries) {
        const txSnap = await getDocs(query(collection(db, 'payroll', entry.id, 'transactions'), orderBy('date', 'desc')));
        const txs = txSnap.docs.map(d => ({ id: d.id, userId: entry.id, ...d.data() })) as Transaction[];
        allTx = allTx.concat(txs);
      }
      // Aggregate stats
      const totalBalance = entries.reduce((sum, e) => sum + (e.balance || 0), 0);
      const totalPaid = allTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalTransactions = allTx.length;
      const recentActivity = allTx.sort((a, b) => {
        const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return db.getTime() - da.getTime();
      }).slice(0, 8);
      setTransactions(allTx);
      setStats({ totalBalance, totalPaid, totalTransactions, recentActivity });
      setLoadingStats(false);
    });
  }, [onUserAdded]);

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
      await setDoc(doc(db, 'payroll', selectedUser.id), {
        userId: selectedUser.id,
        fullName: selectedUser.fullName,
        dailyTargetFee: Number(fee),
        balance: 0, // Initial balance
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

  const filteredUsers = users.filter(u => 
    !payrollUsers.includes(u.id) &&
    (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <Box sx={{ mt: 4 }}>

      {/* Dashboard Cards Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {/* Current Balance Card */}
        <Paper elevation={4} sx={{ flex: 1, minWidth: 260, p: 3, background: 'linear-gradient(135deg, #007bff 60%, #00c6fb 100%)', color: 'white', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Current Payroll Balance</Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>KES {stats.totalBalance.toLocaleString()}</Typography>
        </Paper>
        {/* Recent Transactions Card */}
        <Paper elevation={4} sx={{ flex: 2, minWidth: 340, p: 3, background: 'linear-gradient(135deg, #232526 60%, #414345 100%)', color: 'white', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Transactions</Typography>
          {loadingStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
          ) : (
            <Box>
              {stats.recentActivity.length === 0 ? (
                <Typography sx={{ color: 'gray' }}>No recent activity</Typography>
              ) : (
                stats.recentActivity.map((tx, i) => {
                  const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
                  const rider = payrollEntries.find(e => e.id === tx.userId)?.fullName || tx.userId;
                  return (
                    <Box key={tx.id} sx={{ mb: 1, p: 1.5, borderRadius: 2, background: i % 2 === 0 ? '#23272b' : '#18191c', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: '#4FC3F7', fontWeight: 700, minWidth: 140 }}>{txDate.toLocaleString()}</Typography>
                      <Typography sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>{rider}</Typography>
                      <Typography sx={{ color: '#43e97b', fontWeight: 700, minWidth: 100 }}>KES {tx.amount}</Typography>
                      <Typography sx={{ color: 'white', flex: 1 }}>{tx.description}</Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Payroll Users Table with Daily Fee Status */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#1E1E1E', mb: 4 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #007bff' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>All Payroll Users & Daily Fee Status</Typography>
        </Box>
        {loadingStats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table sx={{ borderCollapse: 'collapse' }}>
              <TableHead sx={{ backgroundColor: '#000000' }}>
                <TableRow>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Rider</TableCell>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Daily Target Fee</TableCell>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Today's Status</TableCell>
                  <TableCell sx={{ border: '1px solid #007bff', fontWeight: 'bold', color: 'white' }}>Time Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ color: 'gray', textAlign: 'center' }}>No payroll users</TableCell>
                  </TableRow>
                ) : (
                  payrollEntries.map(entry => {
                    // Calculate today's total paid for this user
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const userTx = transactions.filter(tx => tx.userId === entry.id);
                    const todayTotal = userTx.filter(tx => {
                      const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
                      return txDate >= today && txDate < new Date(today.getTime() + 24*60*60*1000);
                    }).reduce((sum, tx) => sum + Number(tx.amount), 0);
                    const cleared = todayTotal >= (entry.dailyTargetFee || 820);
                    // Progress bar logic: 24hr window starts from payroll join time
                    const now = new Date();
                    // Assume entry.payrollJoinTime is a Firestore Timestamp or ISO string
                    let joinTime = entry.payrollJoinTime;
                    if (joinTime && joinTime.toDate) {
                      joinTime = joinTime.toDate();
                    } else if (typeof joinTime === 'string') {
                      joinTime = new Date(joinTime);
                    } else if (!(joinTime instanceof Date)) {
                      joinTime = null;
                    }
                    let percent = 0;
                    if (joinTime) {
                      const msElapsed = now.getTime() - joinTime.getTime();
                      percent = Math.min(100, Math.max(0, (msElapsed / (24*60*60*1000)) * 100));
                    }
                    let barColor = '#fff';
                    if (cleared) {
                      barColor = '#43e97b';
                    } else if (percent < 50) {
                      barColor = '#43e97b';
                    } else if (percent < 75) {
                      barColor = '#ffa726';
                    } else if (percent < 90) {
                      barColor = '#ff9800';
                    } else {
                      barColor = '#f44336';
                    }
                    return (
                      <TableRow key={entry.id}>
                        <TableCell sx={{ border: '1px solid #007bff', color: 'white', fontWeight: 700 }}>{entry.fullName}</TableCell>
                        <TableCell sx={{ border: '1px solid #007bff', color: '#00c6fb', fontWeight: 700 }}>KES {entry.dailyTargetFee}</TableCell>
                        <TableCell sx={{ border: '1px solid #007bff' }}>
                          <Box component="span" sx={{
                            px: 2, py: 0.5, borderRadius: 2, fontWeight: 700,
                            background: cleared ? 'linear-gradient(90deg,#43e97b 60%,#38f9d7 100%)' : 'linear-gradient(90deg,#f7971e 60%,#ffd200 100%)',
                            color: cleared ? '#222' : '#222',
                            fontSize: 15,
                            boxShadow: cleared ? '0 0 8px #43e97b55' : '0 0 8px #ffd20055',
                            textAlign: 'center',
                          }}>
                            {cleared ? 'Cleared' : 'Not Cleared'}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #007bff', background: '#191a1c', py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: 140 }}>
                            <Box sx={{ width: 90, height: 10, borderRadius: 4, background: '#222', overflow: 'hidden' }}>
                              <Box sx={{ width: `${percent}%`, height: '100%', background: barColor, transition: 'width 0.5s, background 0.5s' }} />
                            </Box>
                            <Typography sx={{ color: barColor, fontWeight: 700, minWidth: 32 }}>{Math.round(percent)}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

    </Box>
  );
}
