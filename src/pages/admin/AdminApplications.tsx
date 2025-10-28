import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination, Chip, CircularProgress, Button, Card, CardContent, Checkbox } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firestore';
import { visuallyHidden } from '@mui/utils';

interface Application {
  id: string;
  type?: string;
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  address?: string;
  reason?: string;
  otherReason?: string;
  date?: string;
  time?: string;
  status?: string;
  createdAt?: any;
  addressed?: boolean;
  declined?: boolean;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const tableColumns: Record<string, { id: string; label: string }[]> = {
  getBike: [
    { id: 'number', label: '#' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
    { id: 'idNumber', label: 'ID Number' },
    { id: 'address', label: 'Address' },
    { id: 'reason', label: 'Reason' },
    { id: 'otherReason', label: 'Other Reason' },
    { id: 'status', label: 'Status' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'declined', label: 'Declined' },
    { id: 'createdAt', label: 'Submitted' },
  ],
  appointment: [
    { id: 'number', label: '#' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'date', label: 'Date' },
    { id: 'time', label: 'Time' },
    { id: 'reason', label: 'Reason' },
    { id: 'status', label: 'Status' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'declined', label: 'Declined' },
    { id: 'createdAt', label: 'Submitted' },
  ],
  delivery: [
    { id: 'number', label: '#' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
    { id: 'experience', label: 'Experience' },
    { id: 'license', label: 'License' },
    { id: 'status', label: 'Status' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'declined', label: 'Declined' },
    { id: 'createdAt', label: 'Submitted' },
  ],
  manage: [
    { id: 'number', label: '#' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
    { id: 'bikeModel', label: 'Bike Model' },
    { id: 'plate', label: 'Plate' },
    { id: 'terms', label: 'Terms/Notes' },
    { id: 'status', label: 'Status' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'declined', label: 'Declined' },
    { id: 'createdAt', label: 'Submitted' },
  ],
  requestDelivery: [
    { id: 'number', label: '#' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
    { id: 'business', label: 'Business' },
    { id: 'packageType', label: 'Package Type' },
    { id: 'frequency', label: 'Frequency' },
    { id: 'status', label: 'Status' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'declined', label: 'Declined' },
    { id: 'createdAt', label: 'Submitted' },
  ],
  default: [
    { id: 'number', label: '#' },
    { id: 'type', label: 'Type' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'status', label: 'Status' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'declined', label: 'Declined' },
    { id: 'createdAt', label: 'Submitted' },
  ],
};


export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Application>('createdAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'applications'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setApplications(data);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleRequestSort = (property: keyof Application) => {
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

  // Filter and search logic
  const filteredApplications = React.useMemo(() => {
    let filtered = applications;
    if (typeFilter) {
      filtered = filtered.filter(app => (app.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (actionFilter) {
      if (actionFilter === 'addressed') filtered = filtered.filter(app => app.addressed);
      else if (actionFilter === 'declined') filtered = filtered.filter(app => app.declined);
      else if (actionFilter === 'unaddressed') filtered = filtered.filter(app => !app.addressed && !app.declined);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(app =>
        Object.values(app).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(s)
        )
      );
    }
    return filtered;
  }, [applications, typeFilter, actionFilter, search]);

  const sortedApplications = React.useMemo(() =>
    [...filteredApplications].sort((a, b) => {
      const aVal = (a[orderBy] ?? '').toString().toLowerCase();
      const bVal = (b[orderBy] ?? '').toString().toLowerCase();
      if (order === 'asc') return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    })
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredApplications, order, orderBy, page, rowsPerPage]
  );

  // Application type options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'getBike', label: 'Get Bike' },
    { value: 'appointment', label: 'Book Appointment' },
    { value: 'delivery', label: 'Delivery Person' },
    { value: 'manage', label: 'Give Out Bike' },
    { value: 'requestDelivery', label: 'Request Delivery' },
  ];

  // Determine which columns to show based on filter
  const currentColumns = typeFilter && tableColumns[typeFilter] ? tableColumns[typeFilter] : tableColumns.default;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#00c6fb', mb: { xs: 2, md: 0 }, letterSpacing: 1 }}>Applications</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box>
            <label style={{ color: '#fff', fontWeight: 600, marginRight: 8 }}>Type:</label>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
              style={{ padding: '8px 16px', borderRadius: 6, background: '#23272b', color: '#fff', border: '1px solid #333', fontSize: 16 }}
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Box>
          <Box>
            <label style={{ color: '#fff', fontWeight: 600, marginRight: 8 }}>Action:</label>
            <select
              value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(0); }}
              style={{ padding: '8px 16px', borderRadius: 6, background: '#23272b', color: '#fff', border: '1px solid #333', fontSize: 16 }}
            >
              <option value="">All</option>
              <option value="addressed">Addressed</option>
              <option value="unaddressed">Unaddressed</option>
              <option value="declined">Declined</option>
            </select>
          </Box>
          <Box>
            <label style={{ color: '#fff', fontWeight: 600, marginRight: 8 }}>Search:</label>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search applications..."
              style={{ padding: '8px 16px', borderRadius: 6, background: '#23272b', color: '#fff', border: '1px solid #333', fontSize: 16 }}
            />
          </Box>
        </Box>
      </Box>
      <Card sx={{ mb: 4, background: 'linear-gradient(90deg, #23272b 0%, #181818 100%)', color: '#fff', borderRadius: 3, boxShadow: '0 4px 32px #000a', p: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00c6fb', mb: 1 }}>All Applications</Typography>
          <Typography sx={{ color: '#ccc' }}>
            Below is a live list of all applications submitted. You can sort, search, filter by type, and review each application in detail. This section is designed to be visually stunning and easy to use.
          </Typography>
        </CardContent>
      </Card>
      {/* Stats Card */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #4FC3F7' }}>
            <Typography variant="h6">Total Applications</Typography>
            <Typography variant="h4">{filteredApplications.length}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #43a047' }}>
            <Typography variant="h6">Addressed</Typography>
            <Typography variant="h4">{filteredApplications.filter(a => a.addressed).length}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #EF5350' }}>
            <Typography variant="h6">Unaddressed</Typography>
            <Typography variant="h4">{filteredApplications.filter(a => !a.addressed && !a.declined).length}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #c62828' }}>
            <Typography variant="h6">Declined</Typography>
            <Typography variant="h4">{filteredApplications.filter(a => a.declined).length}</Typography>
          </Paper>
        </Box>
      </Box>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'auto', bgcolor: '#1e1e1e', color: '#fff', boxShadow: '0 4px 32px #000a' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
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
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#23272b' }}>
                <TableRow>
                  {currentColumns.map((col) => (
                    <TableCell key={col.id} sortDirection={orderBy === col.id ? order : false} sx={{ color: '#fff', fontWeight: 700, minWidth: 90 }}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleRequestSort(col.id as keyof Application)}
                        sx={{ color: '#fff', '&.Mui-active': { color: '#fff' }, '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}
                      >
                        {col.label}
                        {orderBy === col.id ? (
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
                {sortedApplications.map((app, idx) => (
                  <TableRow
                    key={app.id}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: app.declined ? '#b71c1c' : app.addressed ? '#2e7d32' : '#23272b' },
                      bgcolor: app.declined ? '#c62828' : app.addressed ? '#388e3c' : undefined,
                      color: app.declined || app.addressed ? '#fff' : undefined,
                      transition: 'background 0.2s',
                    }}
                  >
                    {currentColumns.map(col => (
                      <TableCell key={col.id} sx={{ color: '#fff', fontWeight: col.id === 'name' ? 600 : 400 }}>
                        {col.id === 'number' ? (
                          idx + 1 + page * rowsPerPage
                        ) : col.id === 'status' ? (
                          <Chip label={app.status || 'Pending'} color={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : 'warning'} size="small" />
                        ) : col.id === 'createdAt' ? (
                          app.createdAt && app.createdAt.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleString() : ''
                        ) : col.id === 'addressed' ? (
                          <Checkbox
                            checked={!!app.addressed}
                            onChange={async (e) => {
                              const newVal = e.target.checked;
                              try {
                                await updateDoc(doc(db, 'applications', app.id), { addressed: newVal, declined: newVal ? false : app.declined });
                                setApplications(prev => prev.map(a => a.id === app.id ? { ...a, addressed: newVal, declined: newVal ? false : a.declined } : a));
                              } catch {}
                            }}
                            sx={{
                              color: app.addressed ? '#43a047' : '#fff',
                              '&.Mui-checked': {
                                color: '#43a047',
                              },
                            }}
                          />
                        ) : col.id === 'declined' ? (
                          <Checkbox
                            checked={!!app.declined}
                            onChange={async (e) => {
                              const newVal = e.target.checked;
                              try {
                                await updateDoc(doc(db, 'applications', app.id), { declined: newVal, addressed: newVal ? false : app.addressed });
                                setApplications(prev => prev.map(a => a.id === app.id ? { ...a, declined: newVal, addressed: newVal ? false : a.addressed } : a));
                              } catch {}
                            }}
                            sx={{
                              color: app.declined ? '#c62828' : '#fff',
                              '&.Mui-checked': {
                                color: '#c62828',
                              },
                            }}
                          />
                        ) : (
                          app[col.id as keyof Application] || ''
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          sx={{ color: '#fff' }}
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredApplications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
