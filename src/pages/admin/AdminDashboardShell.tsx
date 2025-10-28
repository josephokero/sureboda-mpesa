import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, CssBaseline, Button, Stack, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Skeleton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Outlet, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

import EventIcon from '@mui/icons-material/Event';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin-dashboard/users' },
  { text: 'Bikes', icon: <DirectionsBikeIcon />, path: '/admin-dashboard/bikes' },
  { text: 'Payments', icon: <PaymentIcon />, path: '/admin-dashboard/payments' },
  { text: 'Payroll', icon: <PaymentIcon />, path: '/admin-dashboard/payroll' },
  { text: 'Application', icon: <EventIcon />, path: '/admin-dashboard/application' },
  { text: 'Support & Issues', icon: <SupportAgentIcon />, path: '/admin-dashboard/support' },
  { text: 'Subscribe', icon: <SubscriptionsIcon />, path: '/admin-dashboard/subscribe' },
  { text: 'Supportive', icon: <VolunteerActivismIcon />, path: '/admin-dashboard/supportive' },
];

export default function AdminDashboardShell() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      navigate('/login');
    });
  };
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181818 30%, #111 90%)' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, background: '#111', color: '#fff' }}>
        <Toolbar sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 80 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900 }}>
            Admin Dashboard
          </Typography>
          {/* Desktop menu */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', lg: 'flex' } }}>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={120} height={40} sx={{ borderRadius: 2, bgcolor: 'grey.900' }} />
              ))
            ) : (
              menuItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: '#00c6fb',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    background: 'rgba(0,0,0,0.15)',
                    '&:hover': {
                      background: 'rgba(0,198,251,0.08)',
                      color: '#fff',
                    },
                    textTransform: 'none',
                  }}
                >
                  {item.text}
                </Button>
              ))
            )}
          </Stack>
          {/* Mobile menu icon */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', lg: 'none' } }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ ml: 2, borderRadius: 2, fontWeight: 700, borderColor: '#f44336', color: '#f44336', '&:hover': { background: 'rgba(244,67,54,0.08)', borderColor: '#f44336', color: '#fff' } }}
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { background: '#000', color: '#fff', width: 220 },
        }}
      >
        <Box sx={{ mt: 8 }}>
          <List>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <ListItem key={index} sx={{ px: 2, py: 1.2, my: 0.5 }}>
                  <ListItemIcon>
                    <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'grey.800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Skeleton variant="text" width="80%" sx={{ bgcolor: 'grey.800' }} />}
                  />
                </ListItem>
              ))
            ) : (
              menuItems.map((item) => (
                <ListItem
                  component="button"
                  key={item.text}
                  onClick={() => handleMenuClick(item.path)}
                  sx={{
                    background: 'none',
                    color: '#fff',
                    borderRadius: 2,
                    px: 2,
                    py: 1.2,
                    my: 0.5,
                    minHeight: 48,
                    boxShadow: 'none',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'rgba(0,198,251,0.12)',
                      color: '#00c6fb',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#00c6fb' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ p: 3, background: '#111', minHeight: '100vh', pt: 10 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
