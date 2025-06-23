import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, TablePagination, DialogContentText, IconButton
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const GestionUtilisateurs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAgentRoute = location.pathname.startsWith('/agent');
  
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({ Cin: "", nom: "", email: "", formation: "", role: "" });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);

  // Récupération des infos de l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('agentInfo') || localStorage.getItem('adminInfo') || '{}');

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/utilisateurs");
      setUtilisateurs(res.data);
    } catch (error) {
      console.error("Erreur chargement :", error);
    }
  };

  const handleEdit = (user) => {
    // Pour les agents, limiter l'édition à certains champs
    if (isAgentRoute) {
      setForm({
        Cin: user.Cin,
        nom: user.Nom_et_prénom,
        email: user.email || user.Email,
        formation: user.filière || "",
        role: user.role,
      });
    } else {
      // Pour les admins, permettre une édition complète
      setForm({
        Cin: user.Cin,
        nom: user.Nom_et_prénom,
        email: user.email || user.Email,
        formation: user.filière || "",
        role: user.role,
      });
    }
    setEditing(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/utilisateurs/${form.Cin}`, form);
      fetchUtilisateurs();
      setSnackbar({ open: true, message: "Utilisateur mis à jour", severity: "success" });
      setOpen(false);
    } catch (error) {
      console.error("Erreur modification :", error);
      setSnackbar({ open: true, message: "Erreur lors de la modification", severity: "error" });
    }
  };

  const handleConfirmDelete = (user) => {
    // Pour les agents, vérifier les permissions avant suppression
    if (isAgentRoute && currentUser.role !== 'Administrateur') {
      setSnackbar({ open: true, message: "Action non autorisée", severity: "warning" });
      return;
    }
    setSelectedUserToDelete(user);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUserToDelete) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/utilisateurs/${selectedUserToDelete.Cin}`, {
        params: { role: selectedUserToDelete.role },
      });
      setUtilisateurs(utilisateurs.filter(u => u.Cin !== selectedUserToDelete.Cin));
      setSnackbar({ open: true, message: "Utilisateur supprimé avec succès", severity: "success" });
    } catch (error) {
      console.error("Erreur suppression :", error);
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    }
    setConfirmDeleteOpen(false);
  };

  const handleBack = () => {
    navigate(isAgentRoute ? '/agent/dashboard' : '/admin/dashboard');
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={handleBack} 
        sx={{ mb: 2 }}
      >
        Retour
      </Button>
      
      <h2>{isAgentRoute ? 'Gestion des Utilisateurs (Agent)' : 'Gestion des Utilisateurs'}</h2>

      <TextField
        label="Rechercher par nom ou CIN"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CIN</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {utilisateurs
              .filter(u => 
                u.Nom_et_prénom.toLowerCase().includes(search.toLowerCase()) ||
                u.Cin.toString().includes(search)
              )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.Cin}>
                  <TableCell>{user.Cin}</TableCell>
                  <TableCell>{user.Nom_et_prénom}</TableCell>
                  <TableCell>{user.email || user.Email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(user)}
                      disabled={isAgentRoute && currentUser.role !== 'Administrateur'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleConfirmDelete(user)}
                      disabled={isAgentRoute && currentUser.role !== 'Administrateur'}
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
          count={utilisateurs.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Dialog Modification */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Modifier Utilisateur" : "Ajouter Utilisateur"}</DialogTitle>
        <DialogContent>
          <TextField 
            label="CIN" 
            fullWidth 
            margin="dense" 
            value={form.Cin} 
            disabled={editing}
            onChange={(e) => setForm({ ...form, Cin: e.target.value })}
          />
          <TextField 
            label="Nom" 
            fullWidth 
            margin="dense" 
            value={form.nom} 
            onChange={(e) => setForm({ ...form, nom: e.target.value })} 
          />
          <TextField 
            label="Email" 
            fullWidth 
            margin="dense" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
          />
          {!isAgentRoute && (
            <TextField
              label="Rôle"
              fullWidth
              margin="dense"
              select
              SelectProps={{ native: true }}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
              <option value="agent">Agent</option>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} color="primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmation Suppression */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUserToDelete?.Nom_et_prénom}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert 
          elevation={6} 
          variant="filled" 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default GestionUtilisateurs;