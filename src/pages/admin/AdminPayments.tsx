import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tabs, Tab, Button, IconButton, TextField } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import AddToPayrollSection from './AddToPayrollSection';
import PayrollListSection from './PayrollListSection';
import { db } from '../../firestore';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

// This interface needs to match the one in AdminUsers.tsx for consistency
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  active: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const MotionTableRow = motion(TableRow);

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminPayments() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDocs(collection(db, 'users'))
      .then(snapshot => {
        const usersData = snapshot.docs
          .map(doc => ({ id: doc.id, ...(doc.data() as Partial<User>) }))
          .filter((u): u is User =>
            typeof u.fullName === 'string' &&
            typeof u.email === 'string' &&
            typeof u.phone === 'string' &&
            typeof u.location === 'string' &&
            typeof u.role === 'string' &&
            typeof u.active === 'boolean'
          );
        setUsers(usersData.filter(u => u.role === 'Rider'));
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch users');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleView = (user: User) => {
    console.log('View user:', user);
    // Placeholder for view logic
  };

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // Placeholder for edit logic
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, backgroundColor: '#121212' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ textAlign: 'center', p: 4, backgroundColor: '#121212' }}>{error}</Typography>;
  }

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
    <Box sx={{ p: 3, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'white', textAlign: 'center' }}>
        Payments Dashboard
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#1E1E1E' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#007bff' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="payments tabs"
            sx={{
              '& .MuiTab-root': {
                color: 'white',
                fontWeight: 600,
                transition: 'color 0.2s',
              },
              '& .Mui-selected': {
                color: '#2196f3',
                fontWeight: 900,
                background: 'rgba(33,150,243,0.08)',
                borderRadius: 2,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2196f3',
                height: 3,
              },
            }}
          >
            <Tab label="Add to Payroll" />
            <Tab label="Payroll List" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <AddToPayrollSection users={users} onUserAdded={() => { /* Add refresh logic */ }} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <PayrollListSection />
        </TabPanel>
      </Paper>
    </Box>
  );
}