import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firestore';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Card, CardContent, Button, Chip, TableSortLabel, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import BikeDetailDialog from '../../components/BikeDetailDialog';

interface Bike {
  id: string;
  name: string;
  plate: string;
  type: 'Electric' | 'Petrol';
  condition: 'New' | 'Used' | 'Maintenance';
  // Allow new status values for editing
  status: 'Available' | 'Assigned' | 'At Work' | 'Pending' | 'At Service' | 'Not Working' | string;
  createdAt: string;
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

const headCells = [
  { id: 'number', label: '#' },
  { id: 'name', label: 'Name' },
  { id: 'plate', label: 'Plate' },
  { id: 'type', label: 'Type' },
  { id: 'condition', label: 'Condition' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Actions' },
];

const AdminBikes: React.FC = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Bike>>({});
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Bike>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [plateSearch, setPlateSearch] = useState('');

  useEffect(() => {
    const fetchBikes = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'bikes'));
        const bikesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bike));
        setBikes(bikesData);
      } catch (e) {
        setError('Failed to load bikes');
      }
      setLoading(false);
    };
    fetchBikes();
  }, []);

  const handleRequestSort = (property: keyof Bike) => {
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

  const filteredBikes = React.useMemo(() => {
    return bikes.filter(bike => {
      const statusMatch = statusFilter ? String(bike.status).toLowerCase() === statusFilter.toLowerCase() : true;
      const conditionMatch = conditionFilter ? String(bike.condition).toLowerCase() === conditionFilter.toLowerCase() : true;
      const plateMatch = plateSearch ? bike.plate.toLowerCase().includes(plateSearch.toLowerCase()) : true;
      return statusMatch && conditionMatch && plateMatch;
    });
  }, [bikes, statusFilter, conditionFilter, plateSearch]);

  const sortedBikes = React.useMemo(() =>
    [...filteredBikes].sort(getComparator(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredBikes, order, orderBy, page, rowsPerPage]
  );

  // Actions
  const handleView = (bike: Bike) => {
    setSelectedBike(bike);
    setViewDialogOpen(true);
  };
  const handleEdit = (bike: Bike) => {
    setSelectedBike(bike);
    setEditForm(bike);
    setEditDialogOpen(true);
  };
  const handleEditSave = async () => {
    if (!selectedBike) return;
    try {
      const bikeRef = doc(db, 'bikes', selectedBike.id);
      await updateDoc(bikeRef, editForm);
      setBikes(bikes => bikes.map(b => b.id === selectedBike.id ? { ...b, ...editForm } as Bike : b));
      setEditDialogOpen(false);
      setSnackbar({open: true, message: 'Bike updated successfully', severity: 'success'});
    } catch (err) {
      setSnackbar({open: true, message: 'Failed to update bike', severity: 'error'});
    }
  };
  const handleDelete = (bike: Bike) => {
    setSelectedBike(bike);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedBike) return;
    try {
      const bikeRef = doc(db, 'bikes', selectedBike.id);
      await deleteDoc(bikeRef);
      setBikes(bikes => bikes.filter(b => b.id !== selectedBike.id));
      setDeleteDialogOpen(false);
      setSnackbar({open: true, message: 'Bike deleted successfully', severity: 'success'});
    } catch (err) {
      setSnackbar({open: true, message: 'Failed to delete bike', severity: 'error'});
    }
  };

  const getStatusChipColor = (status: Bike['status']) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Assigned':
        return 'warning';
      case 'At Work':
        return 'info';
      case 'Pending':
        return 'secondary';
      case 'At Service':
        return 'primary';
      case 'Not Working':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getConditionChipColor = (condition: Bike['condition']) => {
    if (condition === 'New') return 'success';
    if (condition === 'Used') return 'info';
    return 'error';
  };

  // Live stats reflecting all status values
  const stats = {
    total: bikes.length,
    available: bikes.filter(b => b.status === 'Available').length,
    assigned: bikes.filter(b => b.status === 'Assigned').length,
    atWork: bikes.filter(b => b.status === 'At Work').length,
    pending: bikes.filter(b => b.status === 'Pending').length,
    atService: bikes.filter(b => b.status === 'At Service').length,
    notWorking: bikes.filter(b => b.status === 'Not Working').length,
    electric: bikes.filter(b => b.type === 'Electric').length,
    petrol: bikes.filter(b => b.type === 'Petrol').length,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#00c6fb', mb: { xs: 2, md: 0 } }}>Available Bikes</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box>
            <label style={{ color: '#bbb', fontWeight: 600, marginRight: 8 }}>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #222', background: '#111', color: '#fff', fontWeight: 600 }}
            >
              <option value="">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="At Work">At Work</option>
              <option value="Pending">Pending</option>
              <option value="At Service">At Service</option>
              <option value="Not Working">Not Working</option>
            </select>
          </Box>
          <Box>
            <label style={{ color: '#bbb', fontWeight: 600, marginRight: 8 }}>Filter by Condition:</label>
            <select
              value={conditionFilter}
              onChange={e => setConditionFilter(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: '1px solid #222', background: '#111', color: '#fff', fontWeight: 600 }}
            >
              <option value="">All Conditions</option>
              <option value="new">new</option>
              <option value="used">used</option>
              <option value="old">old</option>
            </select>
          </Box>
          <Box>
            <label style={{ color: '#bbb', fontWeight: 600, marginRight: 8 }}>Search Plate:</label>
            <input
              type="text"
              value={plateSearch}
              onChange={e => setPlateSearch(e.target.value)}
              placeholder="Enter plate number..."
              style={{ padding: 8, borderRadius: 4, border: '1px solid #222', background: '#111', color: '#fff', fontWeight: 600, minWidth: 180 }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #4FC3F7' }}>
            <Typography variant="h6">Total Bikes</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #FFA726' }}>
            <Typography variant="h6">At Work</Typography>
            <Typography variant="h4">{stats.atWork}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #42A5F5' }}>
            <Typography variant="h6">Electric</Typography>
            <Typography variant="h4">{stats.electric}</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px' }}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', borderRadius: 3, borderLeft: '5px solid #FFA726' }}>
            <Typography variant="h6">Petrol</Typography>
            <Typography variant="h4">{stats.petrol}</Typography>
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
                      onClick={() => handleRequestSort(headCell.id as keyof Bike)}
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
              {sortedBikes.map((bike, idx) => (
                <TableRow key={bike.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#2c2c2c' } }}>
                  <TableCell sx={{ color: '#fff' }}>{idx + 1 + page * rowsPerPage}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{bike.name}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{bike.plate}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{bike.type}</TableCell>
                  <TableCell sx={{ color: '#fff' }}><Chip label={bike.condition} color={getConditionChipColor(bike.condition)} size="small" /></TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Chip 
                      label={bike.status}
                      color={getStatusChipColor(bike.status)}
                      size="small"
                      sx={{
                        bgcolor:
                          bike.status === 'At Work' ? '#FFA726' :
                          bike.status === 'Pending' ? '#FFD600' :
                          bike.status === 'At Service' ? '#42A5F5' :
                          bike.status === 'Not Working' ? '#EF5350' :
                          undefined,
                        color:
                          bike.status === 'At Work' ? '#18191c' :
                          bike.status === 'Pending' ? '#18191c' :
                          bike.status === 'At Service' ? '#fff' :
                          bike.status === 'Not Working' ? '#fff' :
                          undefined,
                        fontWeight: 700,
                        fontSize: 15,
                        px: 2,
                        textTransform: 'none',
                        letterSpacing: 0.2,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Button variant="contained" size="small" sx={{ mr: 1, bgcolor: '#4FC3F7', '&:hover': { bgcolor: '#29B6F6' } }} onClick={() => handleView(bike)}>View</Button>
                    <Button variant="contained" size="small" sx={{ mr: 1, bgcolor: '#FFA726', '&:hover': { bgcolor: '#FB8C00' } }} onClick={() => handleEdit(bike)}>Edit</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: '#EF5350', '&:hover': { bgcolor: '#E53935' } }} onClick={() => handleDelete(bike)}>Delete</Button>
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
          count={bikes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Bike Detail Dialog */}
      <BikeDetailDialog open={viewDialogOpen} bike={selectedBike} onClose={() => setViewDialogOpen(false)} />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Bike</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="Plate" fullWidth margin="normal" value={editForm.plate || ''} onChange={e => setEditForm(f => ({ ...f, plate: e.target.value }))} />
          <TextField label="Type" fullWidth margin="normal" value={editForm.type || ''} onChange={e => setEditForm(f => ({ ...f, type: e.target.value as any }))} />
          <TextField label="Condition" fullWidth margin="normal" value={editForm.condition || ''} onChange={e => setEditForm(f => ({ ...f, condition: e.target.value as any }))} />
          <Box sx={{ mt: 2 }}>
            <label style={{ color: '#888', fontWeight: 500 }}>Status</label>
            <select
              style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #222', marginTop: 6, background: '#111', color: '#fff', fontWeight: 600 }}
              value={editForm.status || ''}
              onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Bike['status'] }))}
            >
              <option value="">Select the status</option>
              <option value="At Work">At Work</option>
              <option value="Pending">Pending</option>
              <option value="At Service">At Service</option>
              <option value="Not Working">Not Working</option>
            </select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ bgcolor: '#FFA726', color: '#18191c', fontWeight: 700, borderRadius: 99, px: 3, '&:hover': { bgcolor: '#FB8C00', color: '#fff' } }}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ bgcolor: '#fff', color: '#18191c', fontWeight: 700, borderRadius: 99, px: 3, '&:hover': { bgcolor: '#eee', color: '#18191c' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Bike</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this bike?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open: false}))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(s => ({...s, open: false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBikes;
