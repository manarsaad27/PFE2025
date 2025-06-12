import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Chip
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';

const GestionEvenements = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/evenements");
        setEvents(response.data.data);
      } catch (error) {
        console.error("Erreur chargement événements:", error);
        setSnackbar({ 
          open: true, 
          message: "Erreur lors du chargement des événements", 
          severity: "error" 
        });
      }
    };
    fetchEvents();
  }, []);
  


  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ titre: '', date: null, lieu: '', type: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const handleOpenDialog = (event = null) => {
    setFormData(event || { titre: '', date: null, lieu: '', type: '', description: '' });
    setEditingId(event?.id || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, date: newDate });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/evenements/${editingId}`, formData);
        setSnackbar({
          open: true,
          message: "Événement mis à jour avec succès",
          severity: "success"
        });
      } else {
        await axios.post("http://localhost:5000/api/evenements", formData);
        setSnackbar({
          open: true,
          message: "Événement créé avec succès",
          severity: "success"
        });
      }
      
      // Recharger les événements
      const response = await axios.get("http://localhost:5000/api/evenements");
      setEvents(response.data.data);
      handleCloseDialog();
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors de l'opération",
        severity: "error"
      });
    }
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  // Et la fonction pour afficher les alertes
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  
  const handleDelete = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>Gestion des Événements</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Ajouter un événement
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.titre}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.lieu}</TableCell>
                <TableCell>
                  <Chip label={event.type} color={event.type === 'Conférence' ? 'primary' : 'secondary'} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(event)}><Edit color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(event.id)}><Delete color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? 'Modifier un événement' : 'Ajouter un événement'}</DialogTitle>
        <DialogContent>
          <TextField label="Titre" name="titre" fullWidth margin="normal" value={formData.titre} onChange={handleChange} />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>
          <TextField label="Lieu" name="lieu" fullWidth margin="normal" value={formData.lieu} onChange={handleChange} />
          <TextField label="Type" name="type" fullWidth margin="normal" value={formData.type} onChange={handleChange} />
          <TextField label="Description" name="description" fullWidth multiline rows={4} margin="normal" value={formData.description} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionEvenements;
