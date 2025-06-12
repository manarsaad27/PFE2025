import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, TablePagination, DialogContentText, IconButton,
  Box
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const GestionFilieres = () => {
  const navigate = useNavigate();
  const [filieres, setFilieres] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({ id: "", nom: "" });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);

  useEffect(() => {
    fetchFilieres();
  }, []);

 const fetchFilieres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/filieres");
      // Accédez à res.data.data au lieu de res.data
      setFilieres(res.data.data || []); // Utilisez un tableau vide par défaut
    } catch (error) {
      console.error("Erreur chargement :", error);
      setSnackbar({ open: true, message: "Erreur lors du chargement", severity: "error" });
      setFilieres([]); // Assurez-vous que filieres reste un tableau
    }
  };

  const handleEditClick = (filiere) => {
    setForm({
      id: filiere.id,
      nom: filiere.nom
    });
    setEditing(true);
    setOpen(true);
  };

  const handleDeleteClick = (filiere) => {
    setSelectedToDelete(filiere);
    setConfirmDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/filieres/${form.id}`, { nom: form.nom });
        setSnackbar({ open: true, message: "Filière mise à jour", severity: "success" });
      } else {
        await axios.post("http://localhost:5000/api/filieres", { nom: form.nom });
        setSnackbar({ open: true, message: "Filière créée", severity: "success" });
      }
      fetchFilieres();
      setOpen(false);
    } catch (error) {
      console.error("Erreur :", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "Erreur lors de l'opération",
        severity: "error" 
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/filieres/${selectedToDelete.id}`);
      setFilieres(filieres.filter(f => f.id !== selectedToDelete.id));
      setSnackbar({ open: true, message: "Filière supprimée", severity: "success" });
    } catch (error) {
      console.error("Erreur suppression :", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || "Erreur lors de la suppression",
        severity: "error" 
      });
    }
    setConfirmDeleteOpen(false);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredData = filieres.filter(f => 
    f.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
       <Button 
    startIcon={<ArrowBack />} 
    onClick={() => navigate('/admin/dashboard')} 
    sx={{ mb: 2 }}
  >
    Retour
  </Button>
      <h2>Gestion des Filières</h2>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Rechercher par nom"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            setForm({ id: "", nom: "" });
            setEditing(false);
            setOpen(true);
          }}
        >
          Ajouter Filière
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((filiere) => (
                <TableRow key={filiere.id} hover>
                  <TableCell>{filiere.id}</TableCell>
                  <TableCell>{filiere.nom}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(filiere)}
                      aria-label="modifier"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(filiere)}
                      aria-label="supprimer"
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

      {/* Dialog Modification/Création */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Modifier Filière" : "Ajouter Filière"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la filière"
            fullWidth
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmation Suppression */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la filière "{selectedToDelete?.nom}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default GestionFilieres;