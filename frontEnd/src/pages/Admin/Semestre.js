import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, TablePagination, DialogContentText, IconButton,
  Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
const GestionSemestres = () => {
   const navigate = useNavigate();
  const [semestres, setSemestres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({ id: "", numero: "", classe_id: "" });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);

  useEffect(() => {
    fetchSemestres();
    fetchClasses();
  }, []);

  const fetchSemestres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/semestres");
      setSemestres(res.data.data || res.data); // Gère les deux formats de réponse
    } catch (error) {
      console.error("Erreur chargement:", error.response?.data || error.message);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "Erreur lors du chargement", 
        severity: "error" 
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClasses(res.data.data);
    } catch (error) {
      console.error("Erreur chargement classes :", error);
    }
  };

  const handleEdit = (semestre) => {
    setForm({
      id: semestre.id,
      numero: semestre.numero,
      classe_id: semestre.classe_id
    });
    setEditing(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!form.numero || !form.classe_id) {
        setSnackbar({ 
          open: true, 
          message: "Le numéro et la classe sont obligatoires", 
          severity: "error" 
        });
        return;
      }
  
      const data = {
        numero: parseInt(form.numero),
        classe_id: form.classe_id
      };
  
      if (editing) {
        await axios.put(`http://localhost:5000/api/semestres/${form.id}`, data);
        setSnackbar({ open: true, message: "Semestre mis à jour", severity: "success" });
      } else {
        await axios.post("http://localhost:5000/api/semestres", data);
        setSnackbar({ open: true, message: "Semestre créé", severity: "success" });
      }
      
      fetchSemestres();
      setOpen(false);
    } catch (error) {
      console.error("Erreur détaillée:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "Erreur lors de l'opération", 
        severity: "error" 
      });
    }
  };
  const handleConfirmDelete = (semestre) => {
    setSelectedToDelete(semestre);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/semestres/${selectedToDelete.id}`
      );
  
      if (response.data.success) {
        setSemestres(prev => prev.filter(s => s.id !== selectedToDelete.id));
        setSnackbar({
          open: true,
          message: response.data.message || 'Semestre supprimé avec succès',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Échec de la suppression',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Détails de l\'erreur:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
  
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 
                error.message || 
                'Erreur lors de la suppression',
        severity: 'error'
      });
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredData = semestres.filter(s => 
    s.numero.toString().includes(search.toLowerCase()) ||
    (s.classe && s.classe.toLowerCase().includes(search.toLowerCase()))
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
      <h2>Gestion des Semestres</h2>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Rechercher par numéro ou classe"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            setForm({ id: "", numero: "", classe_id: "" });
            setEditing(false);
            setOpen(true);
          }}
        >
          Ajouter Semestre
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Numéro</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((semestre) => (
                <TableRow key={semestre.id}>
                  <TableCell>{semestre.id}</TableCell>
                  <TableCell>{semestre.numero}</TableCell>
                  <TableCell>{semestre.classe || "Non assignée"}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(semestre)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleConfirmDelete(semestre)}>
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
        <DialogTitle>{editing ? "Modifier Semestre" : "Ajouter Semestre"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Numéro du semestre"
            type="number"
            fullWidth
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="classe-select-label">Classe</InputLabel>
            <Select
              labelId="classe-select-label"
              value={form.classe_id}
              label="Classe"
              onChange={(e) => setForm({ ...form, classe_id: e.target.value })}
            >
              {classes.map((classe) => (
                <MenuItem key={classe.id} value={classe.id}>
                  {classe.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            Êtes-vous sûr de vouloir supprimer le semestre "{selectedToDelete?.numero}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default GestionSemestres;