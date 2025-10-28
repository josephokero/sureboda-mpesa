import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firestore';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useNavigate } from 'react-router-dom';

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number|null>(null);
  const [bikeCount, setBikeCount] = useState<number|null>(null);
  const [supportCount, setSupportCount] = useState<number|null>(null);

  useEffect(() => {
    // Fetch users count
    getDocs(collection(db, 'users')).then(snap => setUserCount(snap.size)).catch(() => setUserCount(null));
    // Fetch bikes count
    getDocs(collection(db, 'bikes')).then(snap => setBikeCount(snap.size)).catch(() => setBikeCount(null));
    // Fetch support/issues count (sum of all users' serviceRequests + issues + returnRequests)
    (async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let total = 0;
        for (const userDoc of usersSnap.docs) {
          const userId = userDoc.id;
          const [service, issues, returns] = await Promise.all([
            getDocs(collection(db, 'users', userId, 'serviceRequests')),
            getDocs(collection(db, 'users', userId, 'issues')),
            getDocs(collection(db, 'users', userId, 'returnRequests')),
          ]);
          total += service.size + issues.size + returns.size;
        }
        setSupportCount(total);
      } catch {
        setSupportCount(null);
      }
    })();
  }, []);
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#fff', letterSpacing: 0.5 }}>Welcome, Admin</Typography>
      {/* Main layout using Stack and Box instead of Grid */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        {/* Main content left */}
        <Box flex={2} minWidth={0}>
          <Paper sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(90deg, #23272b 0%, #181818 100%)', color: '#fff', border: '1px solid #222', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#00c6fb' }}>Admin Overview</Typography>
            <Typography sx={{ color: '#ccc', mb: 2 }}>
              Use the dashboard to manage users, assign bikes, activate accounts, receive payments, and handle support or issues. All data is live and updates in real time.
            </Typography>
            <Typography sx={{ color: '#00c6fb', fontWeight: 700 }}>
              SureBoda Admin Panel — Professional, Clean, and Powerful.
            </Typography>
          </Paper>
          {/* Stats cards row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Paper sx={{ flex: 1, p: 3, borderRadius: 2, background: '#181818', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #0002', border: '1px solid #23272b' }}>
              <PeopleIcon sx={{ fontSize: 36, color: '#00c6fb', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Users</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>{userCount === null ? '--' : userCount}</Typography>
              <Button size="small" sx={{ mt: 1, color: '#00c6fb' }} onClick={() => navigate('/admin-dashboard/users')}>Manage</Button>
            </Paper>
            <Paper sx={{ flex: 1, p: 3, borderRadius: 2, background: '#181818', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #0002', border: '1px solid #23272b' }}>
              <DirectionsBikeIcon sx={{ fontSize: 36, color: '#00c6fb', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Bikes Assigned</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>{bikeCount === null ? '--' : bikeCount}</Typography>
              <Button size="small" sx={{ mt: 1, color: '#00c6fb' }} onClick={() => navigate('/admin-dashboard/assign-bike')}>Assign</Button>
            </Paper>
            <Paper sx={{ flex: 1, p: 3, borderRadius: 2, background: '#181818', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #0002', border: '1px solid #23272b' }}>
              <PaymentIcon sx={{ fontSize: 36, color: '#00c6fb', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Payments</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>--</Typography>
              <Button size="small" sx={{ mt: 1, color: '#00c6fb' }} onClick={() => navigate('/admin-dashboard/payments')}>View</Button>
            </Paper>
            <Paper sx={{ flex: 1, p: 3, borderRadius: 2, background: '#181818', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #0002', border: '1px solid #23272b' }}>
              <SupportAgentIcon sx={{ fontSize: 36, color: '#00c6fb', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Support</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>{supportCount === null ? '--' : supportCount}</Typography>
              <Button size="small" sx={{ mt: 1, color: '#00c6fb' }} onClick={() => navigate('/admin-dashboard/support')}>View</Button>
            </Paper>
          </Stack>
        </Box>
        {/* Quick Actions right */}
        <Box flex={1} minWidth={0}>
          <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #181818 60%, #23272b 100%)', color: '#fff', border: '1px solid #23272b', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#00c6fb', mb: 1 }}>Quick Actions</Typography>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Button variant="outlined" color="primary" fullWidth onClick={() => navigate('/admin-dashboard/users')} sx={{ color: '#00c6fb', borderColor: '#00c6fb', fontWeight: 700 }}>Add User</Button>
              <Button variant="outlined" color="primary" fullWidth onClick={() => navigate('/admin-dashboard/assign-bike')} sx={{ color: '#00c6fb', borderColor: '#00c6fb', fontWeight: 700 }}>Assign Bike</Button>
              <Button variant="outlined" color="primary" fullWidth onClick={() => navigate('/admin-dashboard/payments')} sx={{ color: '#00c6fb', borderColor: '#00c6fb', fontWeight: 700 }}>Payments</Button>
              <Button variant="outlined" color="primary" fullWidth onClick={() => navigate('/admin-dashboard/support')} sx={{ color: '#00c6fb', borderColor: '#00c6fb', fontWeight: 700 }}>Support & Issues</Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default AdminDashboardHome;
