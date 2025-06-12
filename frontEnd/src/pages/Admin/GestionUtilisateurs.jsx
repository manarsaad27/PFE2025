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
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const GestionUtilisateurs = () => {
  const navigate = useNavigate();
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
    setForm({
      Cin: user.Cin,
      nom: user.Nom_et_prénom,
      email: user.email || user.Email,
      formation: user.filière || "",
      role: user.role,
    });
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
    setSelectedUserToDelete(user);
    setConfirmDeleteOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDeleteOpen(false);
    setSelectedUserToDelete(null);
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
    handleCloseConfirmDialog();
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredUsers = utilisateurs.filter(
    (u) =>
      u.Nom_et_prénom.toLowerCase().includes(search.toLowerCase()) ||
      u.Cin.toString().includes(search)
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
      <h2>Gestion des Utilisateurs</h2>

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
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.Cin}>
                  <TableCell>{user.Cin}</TableCell>
                  <TableCell>{user.Nom_et_prénom}</TableCell>
                  <TableCell>{user.email || user.Email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleConfirmDelete(user)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Dialog Modification */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Modifier Utilisateur" : "Ajouter Utilisateur"}</DialogTitle>
        <DialogContent>
          <TextField label="CIN" fullWidth margin="dense" value={form.Cin} disabled />
          <TextField label="Nom" fullWidth margin="dense" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} color="primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmation Suppression */}
      <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUserToDelete?.Nom_et_prénom}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Annuler</Button>
          <Button onClick={handleDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default GestionUtilisateurs;
