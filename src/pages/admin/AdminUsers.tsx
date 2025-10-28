import React, { useEffect, useState } from 'react';
import '../../components/adminUsersResponsive.css';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, IconButton, Tooltip, Card, CardContent, Chip, TableSortLabel, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firestore';
import { visuallyHidden } from '@mui/utils';
import UserDetailView from './UserDetailView'; // Assuming UserDetailView is extracted to its own file

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  active: boolean;
  assignedBike?: string;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] == null) {
    return -1;
  }
  if (a[orderBy] == null) {
    return 1;
  }
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
): (a: { [key in Key]?: number | string | boolean | null }, b: { [key in Key]?: number | string | boolean | null }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: 'number', label: '#' },
  { id: 'fullName', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'location', label: 'Location' },
  { id: 'role', label: 'Role' },
  { id: 'active', label: 'Status' },
  { id: 'actions', label: 'Actions' },
];

export default function AdminUsers() {
  // ...existing code...
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Add/Edit User Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', location: '', role: '', active: true });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const roleOptions = [
    'Rider',
    'Delivery Rider',
    'Bike Owner',
    'Business Delivery Partner',
    'admin',
  ];
  const statusOptions = ['Active', 'Inactive'];

  const openAddDialog = () => {
    setEditMode(false);
    setForm({ fullName: '', email: '', phone: '', location: '', role: '', active: true });
    setFormError('');
    setDialogOpen(true);
    setEditUserId(null);
  };

  const openEditDialog = (user: User) => {
    setEditMode(true);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      active: user.active,
    });
    setFormError('');
    setDialogOpen(true);
    setEditUserId(user.id);
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.fullName || !form.email || !form.phone || !form.role || !form.location) {
      setFormError('Please fill in all fields.');
      return;
    }
    setFormLoading(true);
    try {
      if (editMode && editUserId) {
        // Update user
        await import('firebase/firestore').then(({ doc, updateDoc }) =>
          updateDoc(doc(db, 'users', editUserId), { ...form })
        );
        setUsers(users => users.map(u => u.id === editUserId ? { ...u, ...form } : u));
      } else {
        // Add user
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        const docRef = await addDoc(collection(db, 'users'), {
          ...form,
          createdAt: serverTimestamp(),
        });
        setUsers(users => [{ id: docRef.id, ...form }, ...users]);
      }
      setDialogOpen(false);
      setForm({ fullName: '', email: '', phone: '', location: '', role: '', active: true });
      setEditUserId(null);
    } catch (err) {
      setFormError('Failed to save user.');
    } finally {
      setFormLoading(false);
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof User>('fullName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'users'));
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
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRequestSort = (property: keyof User) => {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailViewOpen(true);
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(u => {
      const roleMatch = roleFilter ? u.role === roleFilter : true;
      const statusMatch = statusFilter ? (statusFilter === 'Active' ? u.active : !u.active) : true;
      const nameMatch = nameSearch ? u.fullName?.toLowerCase().includes(nameSearch.toLowerCase()) : true;
      const emailMatch = emailSearch ? u.email?.toLowerCase().includes(emailSearch.toLowerCase()) : true;
      return roleMatch && statusMatch && nameMatch && emailMatch;
    });
  }, [users, roleFilter, statusFilter, nameSearch, emailSearch]);

  const sortedUsers = React.useMemo(() =>
    [...filteredUsers].sort(getComparator(order, orderBy) as (a: User, b: User) => number)
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, order, orderBy, page, rowsPerPage]
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    withBike: users.filter(u => u.assignedBike).length,
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

  return (
    <Box>
      <Box className="admin-users-toolbar" sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, flexGrow: 1, color: '#4FC3F7' }}>Users</Typography>
        <TextField
          size="small"
          placeholder="Search name..."
          value={nameSearch}
          onChange={e => setNameSearch(e.target.value)}
          sx={{ minWidth: 160, bgcolor: '#23272b', borderRadius: 2, input: { color: '#fff' } }}
          InputProps={{ style: { color: '#fff' } }}
        />
        <TextField
          size="small"
          placeholder="Search email..."
          value={emailSearch}
          onChange={e => setEmailSearch(e.target.value)}
          sx={{ minWidth: 180, bgcolor: '#23272b', borderRadius: 2, input: { color: '#fff' } }}
          InputProps={{ style: { color: '#fff' } }}
        />
        <FormControl sx={{ minWidth: 160, bgcolor: '#23272b', borderRadius: 2 }} size="small">
          <InputLabel sx={{ color: '#bbb', '&.Mui-focused': { color: '#00c6fb' } }}>Filter by Role</InputLabel>
          <Select
            label="Filter by Role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c6fb' } }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#23272b', color: '#fff' } } }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {roleOptions.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140, bgcolor: '#23272b', borderRadius: 2 }} size="small">
          <InputLabel sx={{ color: '#bbb', '&.Mui-focused': { color: '#00c6fb' } }}>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c6fb' } }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#23272b', color: '#fff' } } }}
          >
            <MenuItem value="">All Status</MenuItem>
            {statusOptions.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#4FC3F7', '&:hover': { bgcolor: '#29B6F6' } }} onClick={openAddDialog}>Add User</Button>
      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#18191c', color: '#fff', borderRadius: 3, minWidth: 360 } }}>
        <DialogTitle sx={{ bgcolor: '#18191c', color: '#00c6fb', fontWeight: 900, fontSize: 22 }}>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleDialogSubmit} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              fullWidth
              required
              sx={{ input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }}
              autoFocus
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              fullWidth
              required
              type="email"
              sx={{ input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }}
            />
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              fullWidth
              required
              sx={{ input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }}
            />
            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              fullWidth
              required
              sx={{ input: { color: '#fff' }, label: { color: '#bbb' }, '& label.Mui-focused': { color: '#00c6fb' } }}
            />
            <FormControl fullWidth required>
              <InputLabel sx={{ color: '#bbb', '&.Mui-focused': { color: '#00c6fb' } }}>Role</InputLabel>
              <Select
                label="Role"
                name="role"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c6fb' } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#23272b', color: '#fff' } } }}
              >
                {roleOptions.map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb', '&.Mui-focused': { color: '#00c6fb' } }}>Status</InputLabel>
              <Select
                label="Status"
                name="active"
                value={form.active ? 'Active' : 'Inactive'}
                onChange={e => setForm(f => ({ ...f, active: e.target.value === 'Active' }))}
                sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c6fb' } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#23272b', color: '#fff' } } }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            {formError && <Typography sx={{ color: '#ff5252', fontSize: 15 }}>{formError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#18191c', pb: 2, pr: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#bbb', fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleDialogSubmit} variant="contained" sx={{ bgcolor: '#00c6fb', color: '#18191c', fontWeight: 700, borderRadius: 99, px: 4, '&:hover': { bgcolor: '#ffd600', color: '#18191c' } }} disabled={formLoading}>
            {formLoading ? <CircularProgress size={22} color="inherit" /> : (editMode ? 'Save Changes' : 'Add User')}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #4FC3F7' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #66BB6A' }}>
            <Typography variant="h6">Active</Typography>
            <Typography variant="h4">{stats.active}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #EF5350' }}>
            <Typography variant="h6">Inactive</Typography>
            <Typography variant="h4">{stats.inactive}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #FFA726' }}>
            <Typography variant="h6">With Bikes</Typography>
            <Typography variant="h4">{stats.withBike}</Typography>
          </Paper>
        </Box>
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
                      onClick={() => handleRequestSort(headCell.id as keyof User)}
                      sx={{ color: '#fff', '&.Mui-active': { color: '#fff' }, '& .MuiTableSortLabel-icon': { color: '#fff !important' } }}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.map((user, idx) => (
                <TableRow key={user.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#2c2c2c' } }}>
                  <TableCell sx={{ color: '#fff' }}>{idx + 1 + page * rowsPerPage}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{user.fullName}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{user.phone}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{user.location}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        bgcolor:
                          user.role === 'admin' ? '#ffd600' :
                          user.role === 'Rider' ? '#ff9800' :
                          user.role === 'Delivery Rider' ? '#fff' :
                          user.role === 'Bike Owner' ? '#7e57c2' :
                          user.role === 'Business Delivery Partner' ? '#66bb6a' :
                          '#333',
                        color:
                          user.role === 'admin' ? '#18191c' :
                          user.role === 'Delivery Rider' ? '#18191c' :
                          user.role === 'Bike Owner' ? '#fff' :
                          user.role === 'Business Delivery Partner' ? '#fff' :
                          '#fff',
                        fontWeight: 700,
                        fontSize: 15,
                        px: 2,
                        textTransform: 'none',
                        letterSpacing: 0.2,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}><Chip label={user.active ? 'Active' : 'Inactive'} color={user.active ? 'success' : 'error'} size="small" /></TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewDetails(user)} sx={{ color: '#fff' }}><VisibilityIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton sx={{ color: '#fff' }} onClick={() => openEditDialog(user)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton onClick={() => handleDelete(user.id)} sx={{ color: '#fff' }}><DeleteIcon /></IconButton>
                    </Tooltip>
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {selectedUser && 
        <UserDetailView 
          user={selectedUser} 
          open={detailViewOpen} 
          onClose={() => setDetailViewOpen(false)} 
        />
      }
    </Box>
  );
}
