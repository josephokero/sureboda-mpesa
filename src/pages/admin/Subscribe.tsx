import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Checkbox, TableSortLabel, TablePagination } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firestore';

interface SubscribeEntry {
  id: string;
  email: string;
  date: string;
  active?: boolean;
}

type Order = 'asc' | 'desc';

export default function Subscribe() {
  const [entries, setEntries] = useState<SubscribeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof SubscribeEntry>('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'subscribe'));
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          email: d.email || '',
          date: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : '-',
          active: d.active ?? true,
        };
      });
      setEntries(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] == null) return -1;
    if (a[orderBy] == null) return 1;
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  }
  function getComparator<Key extends keyof any>(order: Order, orderBy: Key) {
    return order === 'desc'
      ? (a: any, b: any) => descendingComparator(a, b, orderBy)
      : (a: any, b: any) => -descendingComparator(a, b, orderBy);
  }

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
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#4FC3F7' }}>Subscribers</Typography>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#1e1e1e', color: '#fff' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#23272b' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((entry, idx) => (
                <TableRow key={entry.id}>
                  <TableCell>{idx + 1 + page * rowsPerPage}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>
                    <Checkbox checked={!!entry.active} disabled />
                  </TableCell>
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
