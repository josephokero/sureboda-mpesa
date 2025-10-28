
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Badge } from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SideMenu from '../components/SideMenu';
import Overview from './rider/Overview';
import AssignedBike from './rider/AssignedBike';
import Payments from './rider/Payments';
import Reports from './rider/Reports';
import Notifications from './rider/Notifications';
import HelpCenter from './rider/HelpCenter';
import Settings from './rider/Settings';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// All dashboard sections now use real components

const RiderDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 30%, #2a2a2a 90%)', color: '#fff' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: `240px` },
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Rider Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/rider-dashboard/notifications')}>
            <Badge badgeContent={4} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/rider-dashboard/settings')}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/rider-dashboard/help')}>
            <HelpIcon />
          </IconButton>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/rider-dashboard/settings')}>
            {/* Kenyan flag SVG only */}
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg" alt="Kenya" style={{ width: 28, height: 18, objectFit: 'cover' }} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <SideMenu open={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="overview" element={<Overview />} />
            <Route path="bike" element={<AssignedBike />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

export default RiderDashboard;
