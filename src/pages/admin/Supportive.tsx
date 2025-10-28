import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Checkbox, TablePagination } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firestore';

interface SupportiveEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  contacted?: boolean;
  date: string;
}

type Order = 'asc' | 'desc';

export default function Supportive() {
  const [entries, setEntries] = useState<SupportiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed unused order and orderBy state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
  const snapshot = await getDocs(collection(db, 'contacting'));
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || '',
          email: d.email || '',
          message: d.message || '',
          contacted: d.contacted ?? false,
          date: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : '-',
        };
      });
      setEntries(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Removed unused descendingComparator and getComparator functions

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress
          size={70}
          thickness={5}
          sx={{
            color: 'transparent',
            background: 'none',
            position: 'relative',
            '& .MuiCircularProgress-circle': {
              stroke: 'url(#blue-gradient)'
            }
          }}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FC3F7" />
              <stop offset="100%" stopColor="#e3f2fd" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#4FC3F7' }}>Supportive Contacts</Typography>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#1e1e1e', color: '#fff' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#23272b' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Contacted</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((entry, idx) => (
                <TableRow key={entry.id} sx={{ bgcolor: entry.contacted ? '#388e3c' : undefined, color: entry.contacted ? '#fff' : undefined }}>
                  <TableCell>{idx + 1 + page * rowsPerPage}</TableCell>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.message}</TableCell>
                  <TableCell>
                    <Checkbox checked={!!entry.contacted} disabled />
                  </TableCell>
                  <TableCell>{entry.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{ color: '#fff' }}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={entries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
    </Box>
  );
}
