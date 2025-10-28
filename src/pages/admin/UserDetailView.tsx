import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, List, ListItem, ListItemText, Divider } from '@mui/material';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firestore';

interface UserDetailViewProps {
  user: any;
  open: boolean;
  onClose: () => void;
}

export default function UserDetailView({ user, open, onClose }: UserDetailViewProps) {
  const [tab, setTab] = useState(0);
  const [subData, setSubData] = useState<any>({});
  const [bikes, setBikes] = useState<any[]>([]);
  const [assignBikeOpen, setAssignBikeOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState('');

  useEffect(() => {
    const fetchSubData = async () => {
      if (!user) return;
      const subcollections = ['assignedBike', 'payments', 'helpRequests', 'issues', 'activities'];
      const data: any = {};
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, `users/${user.id}/${sub}`));
        data[sub] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setSubData(data);
    };
    fetchSubData();
  }, [user]);

  useEffect(() => {
    const fetchBikes = async () => {
      const snap = await getDocs(collection(db, 'bikes'));
      setBikes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    if (assignBikeOpen) {
      fetchBikes();
    }
  }, [assignBikeOpen]);

  const handleAssignBike = async () => {
    if (!selectedBike || !user) return;
    await setDoc(doc(db, `users/${user.id}/assignedBike`, selectedBike), {
      bikeId: selectedBike,
      assignedAt: new Date(),
    });
    setAssignBikeOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { bgcolor: '#1e1e1e', color: '#fff' } }}>
      <DialogTitle sx={{ bgcolor: '#23272b' }}>User Details: {user?.fullName}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex' }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ borderRight: 1, borderColor: 'divider', '& .MuiTab-root': { color: '#fff' } }}
          >
            <Tab label="Profile" />
            <Tab label="Payments" />
            <Tab label="Help Requests" />
            <Tab label="Issues" />
            <Tab label="Activities" />
          </Tabs>
          <Box sx={{ p: 3, flexGrow: 1 }}>
            {tab === 0 && (
              <Box>
                <Typography variant="h6">Profile</Typography>
                <Typography>Name: {user?.fullName}</Typography>
                <Typography>Email: {user?.email}</Typography>
                <Typography>Phone: {user?.phone}</Typography>
                <Typography>Role: {user?.role}</Typography>
                <Typography>Status: {user?.active ? 'Active' : 'Inactive'}</Typography>
              </Box>
            )}
            {tab === 1 && (
              <Box>
                <Typography variant="h6">Payments</Typography>
                {subData.payments?.length > 0 ? (
                  <List>
                    {subData.payments.map((p: any) => (
                      <ListItem key={p.id}>
                        <ListItemText primary={`Amount: ${p.amount || ''}`} secondary={p.date ? new Date(p.date.seconds * 1000).toLocaleString() : ''} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No payments found.</Typography>
                )}
              </Box>
            )}
            {tab === 2 && (
              <Box>
                <Typography variant="h6">Help Requests</Typography>
                {subData.helpRequests?.length > 0 ? (
                  <List>
                    {subData.helpRequests.map((h: any) => (
                      <ListItem key={h.id}>
                        <ListItemText primary={h.subject || h.message || 'Help Request'} secondary={h.date ? new Date(h.date.seconds * 1000).toLocaleString() : ''} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No help requests found.</Typography>
                )}
              </Box>
            )}
            {tab === 3 && (
              <Box>
                <Typography variant="h6">Issues</Typography>
                {subData.issues?.length > 0 ? (
                  <List>
                    {subData.issues.map((i: any) => (
                      <ListItem key={i.id}>
                        <ListItemText primary={i.subject || i.message || 'Issue'} secondary={i.date ? new Date(i.date.seconds * 1000).toLocaleString() : ''} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No issues found.</Typography>
                )}
              </Box>
            )}
            {tab === 4 && (
              <Box>
                <Typography variant="h6">Activities</Typography>
                {subData.activities?.length > 0 ? (
                  <List>
                    {subData.activities.map((a: any) => (
                      <ListItem key={a.id}>
                        <ListItemText primary={a.action || 'Activity'} secondary={a.date ? new Date(a.date.seconds * 1000).toLocaleString() : ''} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No activities found.</Typography>
                )}
              </Box>
            )}
            {/* Other tabs content here */}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#fff' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
