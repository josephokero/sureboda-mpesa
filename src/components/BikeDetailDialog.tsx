import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface BikeDetailDialogProps {
  open: boolean;
  bike: any;
  onClose: () => void;
}

const BikeDetailDialog: React.FC<BikeDetailDialogProps> = ({ open, bike, onClose }) => {
  if (!bike) return null;
  // Format createdAt if it's a Firestore Timestamp
  let createdAtDisplay = '';
  if (bike.createdAt) {
    if (typeof bike.createdAt === 'object' && bike.createdAt.seconds) {
      const date = new Date(bike.createdAt.seconds * 1000);
      createdAtDisplay = date.toLocaleString();
    } else {
      createdAtDisplay = String(bike.createdAt);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bike Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{bike.name}</Typography>
          <Typography>Plate: {bike.plate}</Typography>
          <Typography>Type: {bike.type}</Typography>
          <Typography>Condition: {bike.condition}</Typography>
          <Typography>Status: {bike.status}</Typography>
          <Typography>Created At: {createdAtDisplay}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BikeDetailDialog;
