import React, { useState } from 'react';
import { useAppSettings } from '../AppSettingsContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TwoWheeler as TwoWheelerIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  HelpCenter as HelpCenterIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const drawerWidth = 240;

const mainMenuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/rider-dashboard/overview' },
  { text: 'Assigned Bike', icon: <TwoWheelerIcon />, path: '/rider-dashboard/bike' },
  { text: 'Payments', icon: <PaymentIcon />, path: '/rider-dashboard/payments' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/rider-dashboard/reports' },
  { text: 'Subscribe', icon: <PaymentIcon />, path: '/rider-dashboard/subscribe' },
  { text: 'Supportive', icon: <HelpCenterIcon />, path: '/rider-dashboard/supportive' },
];

const secondaryMenuItems = [
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/rider-dashboard/notifications' },
  { text: 'Help Center', icon: <HelpCenterIcon />, path: '/rider-dashboard/help' },
];

const DrawerContent = () => {
  const { notifications } = useAppSettings();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const auth = getAuth();
  const handleLogout = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      window.location.href = '/login';
    }).catch((error) => {
      // An error happened.
      console.error('Logout Error:', error);
    });
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    if (!notifications) {
      e.preventDefault();
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SureBoda
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{ color: '#fff' }}>
            <ListItemButton>
              <ListItemIcon sx={{ color: '#00c6fb' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        {secondaryMenuItems.map((item) => {
          if (item.text === 'Notifications') {
            return (
              <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{ color: '#fff' }}>
                <ListItemButton
                  disabled={!notifications}
                  onClick={handleNotificationsClick}
                  sx={{ opacity: notifications ? 1 : 0.5, pointerEvents: notifications ? 'auto' : 'none' }}
                >
                  <ListItemIcon sx={{ color: '#00c6fb' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          }
          return (
            <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{ color: '#fff' }}>
              <ListItemButton>
                <ListItemIcon sx={{ color: '#00c6fb' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
          Turn notifications on in Settings to access this feature.
        </MuiAlert>
      </Snackbar>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        <ListItem disablePadding component={Link} to="/rider-dashboard/settings" sx={{ color: '#fff' }}>
          <ListItemButton>
            <ListItemIcon sx={{ color: '#00c6fb' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={handleLogout}>
          <ListItemButton>
            <ListItemIcon sx={{ color: '#00c6fb' }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};

const SideMenu = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)'
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)'
            },
          }}
          open
        >
          <DrawerContent />
        </Drawer>
      )}
    </Box>
  );
}

export default SideMenu;