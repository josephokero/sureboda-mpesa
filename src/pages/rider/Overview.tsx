
import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Rating, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../../firestore';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { formatKES } from '../../utils/paymentUtils';

const StatCard = ({ title, value, icon, highlight = false }: { title: string, value: string | number | React.ReactNode, icon: React.ReactElement, highlight?: boolean }) => (
  <Paper sx={{
    p: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: highlight ? 'linear-gradient(90deg, #181818 60%, #00c6fb22 100%)' : 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    borderRadius: 3,
    minWidth: 220,
    boxShadow: highlight ? '0 4px 24px 0 rgba(0,198,251,0.08)' : undefined,
    border: highlight ? '1.5px solid #00c6fb44' : undefined,
    mb: 1
  }}>
    <Box>
      <Typography variant="subtitle2" sx={{ color: highlight ? '#00c6fb' : '#ccc', fontWeight: highlight ? 700 : 500 }}>{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: highlight ? '#00c6fb' : '#fff' }}>{value}</Typography>
    </Box>
    {icon}
  </Paper>
);

const Overview = () => {
  const [user, setUser] = useState<User | null>(null); // user is set but not used, but required for auth
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setStats({});
        setLoading(false);
        return;
      }
      try {
        // Fetch user doc
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData = userDoc.exists() ? userDoc.data() : {};
        // Fetch payments
        const paymentsSnap = await getDocs(collection(db, 'users', firebaseUser.uid, 'payments'));
        let totalPaid = 0;
        let totalDebits = 0;
        paymentsSnap.forEach(docSnap => {
          const d = docSnap.data();
          if (d.amount > 0) totalPaid += d.amount;
          if (d.amount < 0) totalDebits += Math.abs(d.amount);
        });
        // Fetch ratings (optional: from a ratings subcollection or field)
        let rating = userData.rating || 0;
        let performance = userData.performance || 'Good';
        let ranking = userData.ranking || 0;
        let dailyTarget = userData.dailyTarget || 820;
        let businessLocation = userData.location || 'N/A';
        let balance = totalPaid - totalDebits;
        setStats({
          dailyTarget,
          currentEarnings: totalPaid,
          ranking,
          businessLocation,
          rating,
          performance,
          balance,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch overview data');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  // Quick actions (example: go to payments, request service, etc.)
  const quickActions = [
    { label: 'Make Payment', color: 'primary', href: '/dashboard/payments' },
    { label: 'Request Service', color: 'secondary', href: '/dashboard/bike' },
    { label: 'Report Issue', color: 'warning', href: '/dashboard/bike' },
  ];

  // Calculate balance due (if daily target is set)
  let balanceDue = 0;
  if (stats.dailyTarget && stats.currentEarnings !== undefined) {
    // For demo: assume user should have paid dailyTarget * 30 (for 30 days)
    // In real app, use assigned date and payment logic
    // Here, just show if balance is negative
    balanceDue = stats.balance < 0 ? Math.abs(stats.balance) : 0;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard Overview</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            {/* Responsive flexbox for stat cards */}
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 2,
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}>
              <StatCard title="Balance Due" value={balanceDue > 0 ? formatKES(balanceDue) : 'No Due'} icon={<Box sx={{ width: 40, height: 40, background: balanceDue > 0 ? '#f44336' : '#4caf50', borderRadius: '50%' }} />} highlight={balanceDue > 0} />
              <StatCard title="Daily Target" value={formatKES(stats.dailyTarget || 0)} icon={<Box sx={{ width: 40, height: 40, background: '#00c6fb', borderRadius: '50%' }} />} />
              <StatCard title="Your Ranking" value={`#${stats.ranking || '-'}`} icon={<Box sx={{ width: 40, height: 40, background: '#bfa046', borderRadius: '50%' }} />} />
              {/* Group Performance and Rating together */}
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 3, minWidth: 220, maxWidth: 260, gap: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#ccc', fontWeight: 500 }}>Performance & Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#00c6fb' }}>{stats.performance || 'N/A'}</Typography>
                  <Rating value={stats.rating || 0} precision={0.1} readOnly sx={{ color: '#bfa046', fontSize: 28 }} />
                </Box>
              </Paper>
            </Box>
            {/* Quick Actions */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: 'rgba(0,198,251,0.06)', mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ color: '#00c6fb', fontWeight: 700, mr: 2, mb: { xs: 1, sm: 0 } }}>Quick Actions:</Typography>
              {quickActions.map(action => (
                <Button key={action.label} variant="contained" color={action.color as any} href={action.href} sx={{ fontWeight: 700, borderRadius: 2, minWidth: 140 }}>
                  {action.label}
                </Button>
              ))}
            </Paper>
          </>
        )}
      </Box>
    </motion.div>
  );
}

export default Overview;
