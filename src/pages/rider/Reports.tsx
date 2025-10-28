
import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { CloudDownload as CloudDownloadIcon } from '@mui/icons-material';

const reportsData = [
  { id: 1, title: 'Weekly Earnings Report', period: 'Oct 16 - Oct 22, 2023' },
  { id: 2, title: 'Monthly Performance Summary', period: 'September 2023' },
  { id: 3, title: 'Fuel Consumption Analysis', period: 'Q3 2023' },
  { id: 4, title: 'Maintenance History', period: '2023' },
];

const Reports = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff', mb: 3 }}>
        Reports
      </Typography>
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
        <List>
          {reportsData.map((report) => (
            <ListItem
              key={report.id}
              secondaryAction={
                <IconButton edge="end" aria-label="download">
                  <CloudDownloadIcon sx={{ color: '#00c6fb' }} />
                </IconButton>
              }
              sx={{ 
                mb: 2, 
                background: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: '8px',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.4)',
                }
              }}
            >
              <ListItemText 
                primary={report.title}
                secondary={report.period}
                primaryTypographyProps={{ color: '#fff', fontWeight: 'bold' }}
                secondaryTypographyProps={{ color: '#ccc' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </motion.div>
  );
};

export default Reports;
