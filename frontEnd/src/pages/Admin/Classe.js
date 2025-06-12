import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, TablePagination, DialogContentText, IconButton,
  Box, FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Typography
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
const GestionClasses = () => {
  const navigate = useNavigate();
  // États
  const [classes, setClasses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    details: ''
  });
  const [form, setForm] = useState({
    id: '',
    nom: '',
    filiere_id: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);

 

  // Récupérer les classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data.data || response.data);
    } catch (error) {
      showError('Erreur lors du chargement des classes', error);
    }
  }, []);

  const fetchFilieres = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/filieres');
      setFilieres(response.data.data || response.data);
    } catch (error) {
      showError('Erreur lors du chargement des filières', error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchFilieres();
  }, [fetchClasses, fetchFilieres]);

  // Afficher les erreurs
  const showError = (message, error) => {
    console.error(message, error);
    setSnackbar({
      open: true,
      message: message,
      severity: 'error',
      details: error.response?.data?.message || error.message
    });
  };

  // Afficher les succès
  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'success',
      details: ''
    });
  };

  // Gérer l'édition
  const handleEditClick = (classe) => {
    setForm({
      id: classe.id,
      nom: classe.nom,
      filiere_id: classe.filiere_id
    });
    setEditing(true);
    setOpen(true);
  };

  // Gérer la suppression
  const handleDeleteClick = (classe) => {
    setSelectedToDelete(classe);
    setConfirmDeleteOpen(true);
  };

  // Sauvegarder (création ou modification)
  const handleSave = async () => {
    setLoading(true);
    try {
      if (!form.nom || !form.filiere_id) {
        throw new Error("Tous les champs sont obligatoires");
      }
  
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      let response;
      if (editing) {
        // URL absolue avec vérification
        const apiUrl = `http://localhost:5000/api/classes/${form.id}`;
        console.log("Envoi requête PUT à:", apiUrl); // Debug
        
        response = await axios.put(apiUrl, {
          nom: form.nom,
          filiere_id: form.filiere_id
        }, config);
      } else {
        response = await axios.post("http://localhost:5000/api/classes", {
          nom: form.nom,
          filiere_id: form.filiere_id
        }, config);
      }
  
      console.log("Réponse serveur:", response.data); // Debug
      showSuccess(editing ? "Classe modifiée" : "Classe créée");
      fetchClasses();
      setOpen(false);
    } catch (error) {
      console.error("Erreur détaillée:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      showError("Échec de l'opération", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Confirmer la suppression
  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/classes/${selectedToDelete.id}`
      );
      
      if (response.data.success) {
        setClasses(prev => prev.filter(c => c.id !== selectedToDelete.id));
        showSuccess('Classe supprimée avec succès');
      }
    } catch (error) {
      let errorMessage = 'Erreur lors de la suppression';
      
      if (error.response) {
        // Erreur avec réponse du serveur
        errorMessage = error.response.data.message || errorMessage;
        console.error('Détails erreur:', {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        // Erreur sans réponse (problème réseau, etc.)
        console.error('Erreur réseau:', error.message);
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
      setConfirmDeleteOpen(false);
    }
  };

  // Fermer les notifications
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Filtrage des données
  const filteredData = classes.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    (c.filiere && c.filiere.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ padding: 3 }}>
       <Button 
    startIcon={<ArrowBack />} 
    onClick={() => navigate('/admin/dashboard')} 
    sx={{ mb: 2 }}
  >
    Retour
  </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des Classes</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setForm({ id: '', nom: '', filiere_id: '' });
            setEditing(false);
            setOpen(true);
          }}
          disabled={loading}
          startIcon={<AddIcon />}
        >
          Ajouter Classe
        </Button>
      </Box>

      {/* Barre de recherche */}
      <TextField
        label="Rechercher par nom ou filière"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, width: '100%', maxWidth: 400 }}
      />

      {/* Tableau des classes */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Filière</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((classe) => (
                <TableRow key={classe.id}>
                  <TableCell>{classe.id}</TableCell>
                  <TableCell>{classe.nom}</TableCell>
                  <TableCell>{classe.filiere || 'Non assignée'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(classe)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(classe)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Dialogue de formulaire */}
      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? 'Modifier la Classe' : 'Ajouter une Classe'}
          {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nom de la classe"
              fullWidth
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              disabled={loading}
              sx={{ mb: 3 }}
              error={!form.nom}
              helperText={!form.nom ? 'Ce champ est obligatoire' : ''}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Filière</InputLabel>
              <Select
                value={form.filiere_id}
                label="Filière"
                onChange={(e) => setForm({ ...form, filiere_id: e.target.value })}
                disabled={loading}
                error={!form.filiere_id}
              >
                {filieres.map((filiere) => (
                  <MenuItem key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </MenuItem>
                ))}
              </Select>
              {!form.filiere_id && (
                <Typography variant="caption" color="error">
                  Ce champ est obligatoire
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={loading || !form.nom || !form.filiere_id}
            endIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editing ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={confirmDeleteOpen} onClose={() => !loading && setConfirmDeleteOpen(false)}>
        <DialogTitle>
          Confirmer la suppression
          {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la classe "{selectedToDelete?.nom}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography>{snackbar.message}</Typography>
            {snackbar.details && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {snackbar.details}
              </Typography>
            )}
          </Box>
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default GestionClasses;