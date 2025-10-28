import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, Button, Alert, CircularProgress, Modal, TextField, Card, CardContent, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../../firestore';
import { doc, onSnapshot, collection, query, orderBy, onSnapshot as onSubSnapshot } from 'firebase/firestore';
import { formatKES, isCriticalOverdue } from '../../utils/paymentUtils';
import LinearProgress from '@mui/material/LinearProgress';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TodayIcon from '@mui/icons-material/Today';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const DAILY_PAYMENT = 820;

interface Transaction {
  id: string;
  amount: number;
  date: { seconds: number; nanoseconds: number; };
  description: string;
  type: 'credit' | 'debit';
}

const Payments = () => {
  const [user, setUser] = useState<User | null>(null);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Calculate 24hr progress for payment
  const [progress, setProgress] = useState(0);
  const [progressColor, setProgressColor] = useState('#43e97b');

  useEffect(() => {
    if (!payrollData) return;
    let startTime: Date;
    if (payrollData.lastBalanceReset) {
      startTime = new Date(payrollData.lastBalanceReset);
    } else if (payrollData.payrollJoinTime) {
      if (payrollData.payrollJoinTime.toDate) {
        startTime = payrollData.payrollJoinTime.toDate();
      } else if (typeof payrollData.payrollJoinTime === 'string') {
        startTime = new Date(payrollData.payrollJoinTime);
      } else if (payrollData.payrollJoinTime.seconds) {
        startTime = new Date(payrollData.payrollJoinTime.seconds * 1000);
      } else {
        startTime = new Date();
      }
    } else {
      startTime = new Date();
    }
    const now = new Date();
    const msElapsed = now.getTime() - startTime.getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    let percent = Math.min(100, Math.max(0, (msElapsed / msInDay) * 100));
    setProgress(percent);
  // Blue for 0-30%, Green for 30-70%, Orange for 70-90%, Red for 90-100%
  if (percent < 30) setProgressColor('#2196f3'); // blue
  else if (percent < 70) setProgressColor('#43e97b'); // green
  else if (percent < 90) setProgressColor('#ff9800'); // orange
  else setProgressColor('#f44336'); // red
    // Optionally, update every minute
    const interval = setInterval(() => {
      const now = new Date();
      const msElapsed = now.getTime() - startTime.getTime();
      let percent = Math.min(100, Math.max(0, (msElapsed / msInDay) * 100));
      setProgress(percent);
  if (percent < 30) setProgressColor('#2196f3'); // blue
  else if (percent < 70) setProgressColor('#43e97b'); // green
  else if (percent < 90) setProgressColor('#ff9800'); // orange
  else setProgressColor('#f44336'); // red
    }, 60000);
    return () => clearInterval(interval);
  }, [payrollData]);
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState('');
  const [mpesaSnackbar, setMpesaSnackbar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const payrollDocRef = doc(db, 'payroll', user.uid);
        const unsubSnapshot = onSnapshot(payrollDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setPayrollData({ id: docSnap.id, ...docSnap.data() });
            setIsActivated(true);
            setLoading(false); // Set loading false as soon as payroll doc is found
            // Listen to transactions subcollection
            const transactionsRef = collection(db, 'payroll', user.uid, 'transactions');
            const q = query(transactionsRef, orderBy('date', 'desc'));
            const unsubTrans = onSubSnapshot(q, (querySnapshot) => {
              const txs: Transaction[] = [];
              querySnapshot.forEach((doc) => {
                txs.push({ id: doc.id, ...doc.data() } as Transaction);
              });
              setTransactions(txs);
            });
            // Clean up transactions listener
            return () => unsubTrans();
          } else {
            setIsActivated(false);
            setLoading(false);
          }
        }, (err) => {
          setError("Failed to fetch payment data.");
          console.error(err);
          setLoading(false);
        });
        return () => unsubSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Poll for payment confirmation using backend status endpoint
  const pollPaymentStatus = async (checkoutId: string, userId: string) => {
    let attempts = 0;
    const apiBase = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://sureboda-mpesa.vercel.app';
    while (attempts < 12) { // Poll for up to 1 minute (12 x 5s)
      await new Promise(res => setTimeout(res, 5000));
      try {
        const res = await fetch(`${apiBase}/api/mpesa/payment-status?checkoutId=${encodeURIComponent(checkoutId)}&userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data.status === 'success') {
          return true;
        } else if (data.status === 'failed') {
          return false;
        }
      } catch (err) {
        // Ignore errors and continue polling
      }
      attempts++;
    }
    return false;
  };

  const handleMakePayment = async () => {
    if (!paymentAmount || !phone) {
      setMpesaStatus('Please enter amount and phone number.');
      setMpesaSnackbar(true);
      return;
    }
    // Validate phone: must start with 01 or 07 and be 10 digits
    if (!/^0[17][0-9]{8}$/.test(phone)) {
      setMpesaStatus('Phone number must start with 01 or 07 and be 10 digits.');
      setMpesaSnackbar(true);
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setMpesaStatus('Please enter a valid amount.');
      setMpesaSnackbar(true);
      return;
    }
    try {
      setIsProcessing(true);
      setConfirmationMessage('');
      setMpesaStatus('Processing payment...');
      setMpesaSnackbar(false);
      console.debug('Sending M-Pesa payment', { amount, phone, userId: user?.uid });
      const apiBase = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : 'https://sureboda-mpesa.vercel.app';
      // Send STK push to Vercel backend
      const res = await fetch(`${apiBase}/api/mpesa/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, amount, userId: user?.uid })
      });
      const data = await res.json();
      console.debug('M-Pesa STK Push response', data);
      // The backend returns CheckoutRequestID as data.data.CheckoutRequestID
      const checkoutId = data?.data?.CheckoutRequestID;
      if (data.error) {
        setMpesaStatus('M-Pesa payment failed: ' + data.error);
        setMpesaSnackbar(true);
        setIsProcessing(false);
      } else if (checkoutId && user?.uid) {
        setMpesaStatus('Prompt sent! Complete payment on your phone.');
        setMpesaSnackbar(true);
        // Poll for payment confirmation using backend status endpoint
        const confirmed = await pollPaymentStatus(checkoutId, user.uid);
        if (confirmed) {
          setConfirmationMessage('✅ Payment received! Transaction has been added to your account.');
          setPaymentSuccess(true);
          setTimeout(() => {
            setPaymentSuccess(false);
            setModalOpen(false);
            setConfirmationMessage('');
            setMpesaStatus('');
          }, 2500);
          setPaymentAmount('');
        } else {
          setMpesaStatus('Payment not confirmed. Please check your M-Pesa app.');
          setMpesaSnackbar(true);
        }
        setIsProcessing(false);
      } else {
        setMpesaStatus('Unexpected error. Please try again.');
        setMpesaSnackbar(true);
        setIsProcessing(false);
      }
    } catch (error) {
      setMpesaStatus('Payment failed. Please try again.');
      setMpesaSnackbar(true);
      setIsProcessing(false);
      setConfirmationMessage('');
      console.error('M-Pesa payment error', error);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>{error}</Typography>;
  }

  if (!isActivated) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <Box sx={{ textAlign: 'center', p: 4, color: 'white' }}>
          <HourglassEmptyIcon sx={{ fontSize: 80, color: '#4FC3F7' }} />
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>Account Not Activated for Payments</Typography>
          <Typography variant="body1" sx={{ mt: 1, color: '#ccc' }}>
            Your account is pending activation for daily payments. 
            Please contact your administrator to get started.
          </Typography>
        </Box>
      </motion.div>
    );
  }

  const currentBalance = payrollData?.dailyTargetFee || DAILY_PAYMENT;
  const overdueAmount = Math.max(0, currentBalance);
  const daysLate = Math.floor(overdueAmount / DAILY_PAYMENT);
  const isCritical = isCriticalOverdue(daysLate);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff', mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        My Payments
      </Typography>

      {payrollData?.paymentRequested && (
        <motion.div initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{type: 'spring'}}>
        <Alert severity="warning" icon={<NotificationImportantIcon fontSize="inherit" />} sx={{ mb: 3, background: 'linear-gradient(45deg, #ff9800, #f57c00)', color: 'white', fontWeight: 'bold' }}>
          Your payment is due. The admin has requested you to make a payment.
        </Alert>
        </motion.div>
      )}
      
      {/* Overdue Card Logic */}
      {(() => {
        // Outstanding balance for today: dailyTargetFee minus all today's credit transactions
        const now = new Date();
        const dailyTargetFee = payrollData?.dailyTargetFee || DAILY_PAYMENT;
        // Get all credit transactions for today
        const todayCredits = transactions.filter(tx => {
          if (tx.type !== 'credit' || !tx.date || !tx.date.seconds) return false;
          const txDate = new Date(tx.date.seconds * 1000);
          return (
            txDate.getDate() === now.getDate() &&
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          );
        });
        const paidToday = todayCredits.reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : Number(tx.amount)), 0);
        const outstandingToday = Math.max(0, dailyTargetFee - paidToday);
        // Color logic for overdue days (keep as before)
        let cardColor = '#43e97b';
        // Optionally, you can add more logic for overdue/late, but for today just green
        return (
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            {/* Overdue Card */}
            <Card sx={{ minWidth: 320, background: '#111', border: `2px solid ${cardColor}`, borderRadius: 3, color: cardColor, boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <CardContent sx={{ color: cardColor, textAlign: 'center' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#fff' }} />
                <Typography variant="h6" sx={{ color: '#fff', mt: 1 }}>Outstanding Balance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: cardColor }}>{formatKES(outstandingToday)}</Typography>
                <Box sx={{ mt: 2, width: '100%' }}>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 14, borderRadius: 7, background: '#222', '& .MuiLinearProgress-bar': { backgroundColor: progressColor } }} />
                  <Typography variant="caption" sx={{ color: progressColor, fontWeight: 700, mt: 0.5, display: 'block' }}>
                    {`Time left: ${(100 - progress).toFixed(0)}% (${(24 - (progress/100)*24).toFixed(1)} hrs)`}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: cardColor, fontWeight: 700, mt: 1 }}>
                  {outstandingToday === 0
                    ? 'You are up to date. Please pay today to stay in good standing.'
                    : `You still owe ${formatKES(outstandingToday)} for today.`}
                </Typography>
              </CardContent>
            </Card>
            {/* Next Payment Due Card */}
            <Card sx={{ minWidth: 320, background: 'linear-gradient(45deg, #3a3a3a, #1e1e1e)', border: '1px solid #444', borderRadius: 3, color: 'white', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TodayIcon sx={{ fontSize: 40, color: '#ccc' }} />
                <Typography variant="h6" sx={{ color: '#ccc', mt: 1 }}>Next Payment Due</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}</Typography>
              </CardContent>
            </Card>
          </Box>
        );
      })()}

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
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Payment Status
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  onClick={() => setModalOpen(true)}
                >
                  Make a Payment
                </Button>
            </Box>
            
            {isCritical && (
                <Alert severity="error" sx={{ background: 'rgba(244,67,54,0.12)', color: '#f44336', fontWeight: 700, mb: 2 }}>
                  <strong>URGENT:</strong> Your payment is overdue by {daysLate} days. Please pay immediately to avoid repossession.
                </Alert>
            )}

            <Typography variant="h6" gutterBottom sx={{ color: '#fff', mt: 4 }}>
                Recent Transactions
            </Typography>
            <List>
                {transactions.length === 0 ? (
                  <Typography sx={{ color: '#ccc', fontStyle: 'italic', p: 2 }}>No payment records found.</Typography>
                ) : transactions.map((transaction, index: number) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemText 
                        primary={transaction.description}
                        secondary={transaction.date && transaction.date.seconds ? new Date(transaction.date.seconds * 1000).toLocaleDateString() : ''}
                        primaryTypographyProps={{ color: '#fff', fontWeight: 'bold' }}
                        secondaryTypographyProps={{ color: '#ccc' }}
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ color: transaction.type === 'credit' ? '#4caf50' : '#f44336', fontWeight: 'bold' }}
                      >
                        {transaction.type === 'credit' ? '+' : '-'} {formatKES(Math.abs(transaction.amount))}
                      </Typography>
                    </ListItem>
                    {index < transactions.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                  </React.Fragment>
                ))}
            </List>
          </Box>
      </Paper>

  <Modal open={isModalOpen} onClose={() => !isProcessing && setModalOpen(false)}
        sx={{
          '& .MuiBackdrop-root': {
            background: 'rgba(10,10,10,0.92)',
            backdropFilter: 'blur(2px)',
          }
        }}
      >
        <Box sx={{ p: 4, background: '#181a1b', color: 'white', borderRadius: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 380, border: '1px solid #222', boxShadow: '0 2px 24px #0008', zIndex: 10, overflow: 'visible' }}>
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
            <Button onClick={() => setModalOpen(false)} sx={{ minWidth: 0, p: 0.5, color: '#fff', background: 'transparent', '&:hover': { background: '#222' } }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
          </Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#43e97b', textAlign: 'center', fontSize: 24 }}>Make a Payment</Typography>
          {isProcessing && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <CircularProgress color="success" size={48} sx={{ mb: 2 }} />
              <Typography sx={{ color: '#43e97b', fontWeight: 700, fontSize: 18 }}>Waiting for payment confirmation...</Typography>
              <Typography sx={{ color: '#ccc', fontSize: 14, mt: 1 }}>Please complete the payment on your phone.</Typography>
            </Box>
          )}
          {paymentSuccess && (
            <Alert severity="success" sx={{ mb: 2, fontWeight: 700, background: '#43e97b', color: '#fff', fontSize: 18 }}>
              {confirmationMessage || 'Payment successful!'}<br />
              <span style={{ fontWeight: 400, fontSize: 15 }}>Confirmed: Payment received and transaction added to Firebase.</span>
            </Alert>
          )}
          {(() => {
            // Outstanding balance for current 24hr window: dailyTargetFee minus all credit transactions since lastBalanceReset (or join time)
            const now = new Date();
            const dailyTargetFee = payrollData?.dailyTargetFee || DAILY_PAYMENT;
            // Determine start of 24hr window (same as progress bar)
            let startTime: Date;
            if (payrollData?.lastBalanceReset) {
              startTime = new Date(payrollData.lastBalanceReset);
            } else if (payrollData?.payrollJoinTime) {
              if (payrollData.payrollJoinTime.toDate) {
                startTime = payrollData.payrollJoinTime.toDate();
              } else if (typeof payrollData.payrollJoinTime === 'string') {
                startTime = new Date(payrollData.payrollJoinTime);
              } else if (payrollData.payrollJoinTime.seconds) {
                startTime = new Date(payrollData.payrollJoinTime.seconds * 1000);
              } else {
                startTime = new Date();
              }
            } else {
              startTime = new Date();
            }
            // Get all credit transactions in the current 24hr window
            const windowCredits = transactions.filter(tx => {
              if (tx.type !== 'credit' || !tx.date || !tx.date.seconds) return false;
              const txDate = new Date(tx.date.seconds * 1000);
              return txDate >= startTime && txDate.getTime() - startTime.getTime() < 24 * 60 * 60 * 1000;
            });
            const paidWindow = windowCredits.reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : Number(tx.amount)), 0);
            const outstandingWindow = Math.max(0, dailyTargetFee - paidWindow);
            let amountColor = '#43e97b';
            return (
              <Box sx={{ mb: 3, textAlign: 'center', background: '#111', borderRadius: 2, py: 2, border: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: '#ccc', fontWeight: 500 }}>Outstanding Balance</Typography>
                <Typography variant="h4" sx={{ color: amountColor, fontWeight: 'bold', mt: 0.5 }}>{formatKES(outstandingWindow)}</Typography>
              </Box>
            );
          })()}
          <TextField
            fullWidth
            label="Amount (KES)"
            variant="outlined"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            sx={{ mb: 2, input: { color: '#43e97b', fontWeight: 700, fontSize: 20 }, '& label': { color: '#43e97b' }, '& label.Mui-focused': { color: '#43e97b' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#222' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#43e97b' } }}
          />
          <TextField
            fullWidth
            label="M-Pesa Phone Number"
            variant="outlined"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            sx={{ mb: 2, input: { color: '#43e97b', fontWeight: 700, fontSize: 18 }, '& label': { color: '#43e97b' }, '& label.Mui-focused': { color: '#43e97b' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#222' }, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#43e97b' } }}
          />
      <Snackbar
        open={mpesaSnackbar}
        autoHideDuration={6000}
        onClose={() => setMpesaSnackbar(false)}
        message={mpesaStatus}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
          <Button fullWidth variant="contained" size="large" onClick={handleMakePayment} sx={{ background: '#007bff', color: '#fff', fontWeight: 700, fontSize: 18, boxShadow: 'none', '&:hover': { background: '#0056b3' } }} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </Box>
      </Modal>

    </motion.div>
  );
};

export default Payments;