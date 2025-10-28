import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, Button, Chip, TableSortLabel, TablePagination, Checkbox, Select, MenuItem, Dialog } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firestore';
import { visuallyHidden } from '@mui/utils';

interface SupportMessage {
  id: string;
  user: string;
  userId: string;
  collectionType: 'serviceRequests' | 'issues' | 'returnRequests';
  type: 'Service Request' | 'Issue' | 'Return Request';
  subject: string;
  description: string;
  date: string;
  attended?: boolean;
}

interface User {
  id: string;
  fullName: string;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];
  // Handle boolean fields for sorting
  if (typeof aValue === 'boolean' || typeof bValue === 'boolean') {
    return (bValue === true ? 1 : 0) - (aValue === true ? 1 : 0);
  }
  if (bValue == null) return -1;
  if (aValue == null) return 1;
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator<T>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: 'number', label: '#' },
  { id: 'user', label: 'User' },
  { id: 'type', label: 'Type' },
  { id: 'subject', label: 'Subject' },
  { id: 'date', label: 'Date' },
  { id: 'attended', label: 'Attended' },
  { id: 'actions', label: 'Actions' },
];

export default function AdminSupport() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof SupportMessage>('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [attendedFilter, setAttendedFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allMessages: SupportMessage[] = [];
        for (const userDoc of usersSnapshot.docs) {
          const user = { id: userDoc.id, ...userDoc.data() } as User;
          const serviceRequestsSnapshot = await getDocs(collection(db, 'users', user.id, 'serviceRequests'));
          serviceRequestsSnapshot.forEach(doc => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : (data.timestamp?.toDate ? data.timestamp.toDate() : null);
            const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString() : '-';
            allMessages.push({
              id: doc.id,
              user: user.fullName,
              userId: user.id,
              collectionType: 'serviceRequests',
              type: 'Service Request',
              subject: data.subject,
              description: data.description,
              date: dateStr,
              attended: data.attended,
            });
          });
          const issuesSnapshot = await getDocs(collection(db, 'users', user.id, 'issues'));
          issuesSnapshot.forEach(doc => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : (data.timestamp?.toDate ? data.timestamp.toDate() : null);
            const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString() : '-';
            allMessages.push({
              id: doc.id,
              user: user.fullName,
              userId: user.id,
              collectionType: 'issues',
              type: 'Issue',
              subject: data.title,
              description: data.description,
              date: dateStr,
              attended: data.attended,
            });
          });
          const returnRequestsSnapshot = await getDocs(collection(db, 'users', user.id, 'returnRequests'));
          returnRequestsSnapshot.forEach(doc => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : (data.timestamp?.toDate ? data.timestamp.toDate() : null);
            const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString() : '-';
            allMessages.push({
              id: doc.id,
              user: user.fullName,
              userId: user.id,
              collectionType: 'returnRequests',
              type: 'Return Request',
              subject: data.reason,
              description: data.details,
              date: dateStr,
              attended: data.attended,
            });
          });
        }
        setMessages(allMessages);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch support messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleRequestSort = (property: keyof SupportMessage) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredMessages = React.useMemo(() => {
    if (!attendedFilter) return messages;
    if (attendedFilter === 'attended') return messages.filter(m => m.attended);
    if (attendedFilter === 'unattended') return messages.filter(m => !m.attended);
    return messages;
  }, [messages, attendedFilter]);

  const sortedMessages = React.useMemo(() => 
    [...filteredMessages].sort(getComparator<SupportMessage>(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), 
    [filteredMessages, order, orderBy, page, rowsPerPage]
  );

  const getChipColor = (type: SupportMessage['type']) => {
    switch (type) {
      case 'Service Request': return 'primary';
      case 'Issue': return 'error';
      case 'Return Request': return 'warning';
      default: return 'default';
    }
  };

  const stats = {
    total: messages.length,
    attended: messages.filter(m => m.attended).length,
    unattended: messages.filter(m => !m.attended).length,
    service: messages.filter(m => m.type === 'Service Request').length,
    issues: messages.filter(m => m.type === 'Issue').length,
    returns: messages.filter(m => m.type === 'Return Request').length,
  };

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

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#4FC3F7' }}>Support & Issues</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #4FC3F7' }}>
            <Typography variant="h6">Total Requests</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #43a047' }}>
            <Typography variant="h6">Attended</Typography>
            <Typography variant="h4">{stats.attended}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #EF5350' }}>
            <Typography variant="h6">Unattended</Typography>
            <Typography variant="h4">{stats.unattended}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #29B6F6' }}>
            <Typography variant="h6">Service Requests</Typography>
            <Typography variant="h4">{stats.service}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #F06292' }}>
            <Typography variant="h6">Issues</Typography>
            <Typography variant="h4">{stats.issues}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #FFCA28' }}>
            <Typography variant="h6">Return Requests</Typography>
            <Typography variant="h4">{stats.returns}</Typography>
          </Paper>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Select
          value={attendedFilter}
          onChange={e => setAttendedFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180, bgcolor: '#23272b', color: '#fff', borderRadius: 2 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="attended">Attended</MenuItem>
          <MenuItem value="unattended">Unattended</MenuItem>
        </Select>
      </Box>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#1e1e1e', color: '#fff' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#23272b' }}>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false} sx={{ color: '#fff' }}>
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id as keyof SupportMessage)}
                      sx={{ color: '#fff', '&.Mui-active': { color: '#fff' }, '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedMessages.map((msg, idx) => (
                  <TableRow
                    key={msg.id}
                    sx={{
                      bgcolor: msg.attended ? '#388e3c' : (idx % 2 === 0 ? '#23272b' : '#2c2c2c'),
                      color: msg.attended ? '#fff' : undefined,
                      '& td, & th': { color: msg.attended ? '#fff' : undefined },
                      transition: 'background 0.2s',
                    }}
                  >
                    <TableCell sx={{ color: '#fff' }}>{idx + 1 + page * rowsPerPage}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{msg.user}</TableCell>
                    <TableCell sx={{ color: '#fff' }}><Chip label={msg.type} color={getChipColor(msg.type)} size="small" /></TableCell>
                    <TableCell sx={{ color: '#fff' }}>{msg.subject}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{msg.date}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <Checkbox
                        checked={!!msg.attended}
                        onChange={async (e) => {
                          const newVal = e.target.checked;
                          try {
                            await updateDoc(doc(db, 'users', msg.userId, msg.collectionType, msg.id), { attended: newVal });
                            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, attended: newVal } : m));
                          } catch {}
                        }}
                        sx={{
                          color: msg.attended ? '#43a047' : '#fff',
                          '&.Mui-checked': {
                            color: '#43a047',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ bgcolor: '#4FC3F7', '&:hover': { bgcolor: '#29B6F6' } }}
                        onClick={() => {
                          setSelectedMessage(msg);
                          setDetailOpen(true);
                        }}
                      >
                        View Details
                      </Button>
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
          count={messages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Support Issue Details Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ bgcolor: '#18191c', color: '#fff', p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#4FC3F7', fontWeight: 900 }}>Support Issue Details</Typography>
          {selectedMessage && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><b>User:</b> {selectedMessage.user}</Typography>
              <Typography><b>Type:</b> {selectedMessage.type}</Typography>
              <Typography><b>Subject:</b> {selectedMessage.subject}</Typography>
              <Typography><b>Date:</b> {selectedMessage.date}</Typography>
              <Typography><b>Description:</b> {selectedMessage.description}</Typography>
              <Typography><b>Attended:</b> {selectedMessage.attended ? 'Yes' : 'No'}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ bgcolor: '#4FC3F7', color: '#18191c', fontWeight: 700, borderRadius: 99, px: 4, '&:hover': { bgcolor: '#ffd600', color: '#18191c' } }}>Close</Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
