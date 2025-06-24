import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Chip, Snackbar, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack, People, Print } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const GestionEvenements = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [loading, setLoading] = useState({
    events: false,
    users: false
  });
  const [formData, setFormData] = useState({ 
    titre: '', 
    date: null, 
    lieu: '', 
    type: '', 
    description: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const API_CONFIG = {
    baseURL: "http://localhost:5000",
    endpoints: {
      events: "/api/evenements",
      users: "/api/inscriptions"
    }
  };

  const fetchEvents = async () => {
    setLoading(prev => ({...prev, events: true}));
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.events}`);
      setEvents(response.data.data || response.data);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
      setSnackbar({ 
        open: true, 
        message: "Erreur lors du chargement des événements", 
        severity: "error" 
      });
    } finally {
      setLoading(prev => ({...prev, events: false}));
    }
  };

  const fetchUsers = async () => {
    setLoading(prev => ({...prev, users: true}));
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.users}`);
      const data = response.data.data || response.data;
      
      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide");
      }
      
      setUsersList(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url
      });
      
      let errorMessage = "Erreur lors du chargement des utilisateurs";
      if (error.response?.status === 404) {
        errorMessage = "Endpoint non trouvé - Vérifiez la configuration backend";
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
      setUsersList([]);
    } finally {
      setLoading(prev => ({...prev, users: false}));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenUsersDialog = async () => {
    await fetchUsers();
    setOpenUsersDialog(true);
  };

  const handleOpenDialog = (event = null) => {
    setFormData(event || { 
      titre: '', 
      date: null, 
      lieu: '', 
      type: '', 
      description: '' 
    });
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
        await axios.put(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.events}/${editingId}`, formData);
        setSnackbar({
          open: true,
          message: "Événement mis à jour avec succès",
          severity: "success"
        });
      } else {
        await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.events}`, formData);
        setSnackbar({
          open: true,
          message: "Événement créé avec succès",
          severity: "success"
        });
      }
      
      await fetchEvents();
      handleCloseDialog();
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors de l'opération",
        severity: "error"
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.events}/${id}`);
      setEvents(events.filter(e => e.id !== id));
      setSnackbar({
        open: true,
        message: "Événement supprimé avec succès",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression de l'événement",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des Inscrits</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .print-date { text-align: right; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Liste des Inscrits</h1>
          <div class="print-date">Imprimé le ${new Date().toLocaleDateString()}</div>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Box sx={{ p: 3 }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content, #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>Gestion des Événements</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<People />} 
          onClick={handleOpenUsersDialog}
          sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
          disabled={loading.users}
        >
          {loading.users ? <CircularProgress size={24} /> : 'Liste des inscrits'}
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenDialog()}
          disabled={loading.events}
        >
          Ajouter un événement
        </Button>
      </Box>

      {loading.events ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                    <IconButton onClick={() => handleOpenDialog(event)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(event.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog pour ajouter/modifier un événement */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? 'Modifier un événement' : 'Ajouter un événement'}</DialogTitle>
        <DialogContent>
          <TextField 
            label="Titre" 
            name="titre" 
            fullWidth 
            margin="normal" 
            value={formData.titre} 
            onChange={handleChange} 
            required
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
          </LocalizationProvider>
          <TextField 
            label="Lieu" 
            name="lieu" 
            fullWidth 
            margin="normal" 
            value={formData.lieu} 
            onChange={handleChange} 
            required
          />
          <TextField 
            label="Type" 
            name="type" 
            fullWidth 
            margin="normal" 
            value={formData.type} 
            onChange={handleChange} 
            required
          />
          <TextField 
            label="Description" 
            name="description" 
            fullWidth 
            multiline 
            rows={4} 
            margin="normal" 
            value={formData.description} 
            onChange={handleChange} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour afficher la liste des utilisateurs */}
      <Dialog 
        open={openUsersDialog} 
        onClose={() => setOpenUsersDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Liste des utilisateurs inscrits
          {loading.users && <CircularProgress size={24} sx={{ ml: 2 }} />}
          <Button 
            variant="contained" 
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ float: 'right', mr: 2 }}
            className="no-print"
          >
            Imprimer
          </Button>
        </DialogTitle>
        <DialogContent dividers id="printable-content">
          {usersList.length > 0 ? (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom complet</TableCell>
                    <TableCell>CIN</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Sexe</TableCell>
                    <TableCell>Niveau d'étude</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersList.map((user, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{user.Nom_complet || 'N/A'}</TableCell>
                      <TableCell>{user.CIN || 'N/A'}</TableCell>
                      <TableCell>{user.Email || 'N/A'}</TableCell>
                      <TableCell>{user.Numéro_téléphone || 'N/A'}</TableCell>
                      <TableCell>{user.Sexe || 'N/A'}</TableCell>
                      <TableCell>{user.Niveau_étude || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              p: 4,
              minHeight: 200
            }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {loading.users ? 'Chargement en cours...' : 'Aucun utilisateur trouvé'}
              </Typography>
              {!loading.users && (
                <Button 
                  variant="outlined" 
                  onClick={fetchUsers}
                  startIcon={<People />}
                  sx={{ mt: 2 }}
                >
                  Réessayer
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={() => setOpenUsersDialog(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionEvenements;