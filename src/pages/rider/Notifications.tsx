
import React from 'react';
import { useAppSettings } from '../../AppSettingsContext';
import { Alert } from '@mui/material';
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Notifications as NotificationsIcon, Payment as PaymentIcon, Warning as WarningIcon } from '@mui/icons-material';

const notificationsData = [
  { id: 1, type: 'payment', text: 'Your weekly payment of KES 1,500 is due tomorrow.', time: '2 hours ago', icon: <PaymentIcon /> },
  { id: 2, type: 'alert', text: 'Your bike is due for service.', time: '1 day ago', icon: <WarningIcon /> },
  { id: 3, type: 'info', text: 'New safety guidelines have been published.', time: '3 days ago', icon: <NotificationsIcon /> },
  { id: 4, type: 'payment', text: 'Payment of KES 500 received.', time: '5 days ago', icon: <PaymentIcon /> },
];

const Notifications = () => {
  const { notifications } = useAppSettings();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff', mb: 3 }}>
        Notifications
      </Typography>
      {!notifications ? (
        <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid #00c6fb' }}>
          Notifications are turned off. Please enable notifications in Settings to view your notifications.
        </Alert>
      ) : (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            borderRadius: '16px', 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <List>
            {notificationsData.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.type === 'alert' ? '#f44336' : '#00c6fb' }}>
                      {notification.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.text}
                    secondary={notification.time}
                    primaryTypographyProps={{ color: '#fff' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItem>
                {index < notificationsData.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </motion.div>
  );
};

export default Notifications;
