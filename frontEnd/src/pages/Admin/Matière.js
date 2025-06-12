import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, TablePagination, DialogContentText, IconButton,
  Select, MenuItem, InputLabel, FormControl, Box
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
const GestionMatieres = () => {
   const navigate = useNavigate();
  const [matieres, setMatieres] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({ 
    id: "", 
    nom: "", 
    credits: "", 
    enseignant_id: "", 
    semestre_id: "" 
  });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);

  useEffect(() => {
    fetchMatieres();
    fetchSemestres();
    fetchEnseignants();
  }, []);

  const fetchMatieres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matieres");
      setMatieres(res.data.data || res.data); // Gère les deux formats de réponse
    } catch (error) {
      console.error("Erreur chargement:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors du chargement",
        severity: "error"
      });
    }
  };

  const fetchSemestres = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/semestres");
    setSemestres(res.data.data);
  } catch (error) {
    console.error("Erreur chargement semestres :", error);
    setSnackbar({
      open: true,
      message: "Erreur lors du chargement des semestres",
      severity: "error"
    });
  }
};


  const fetchEnseignants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/utilisateurs");
      setEnseignants(res.data.filter(u => u.role === "enseignant"));
    } catch (error) {
      console.error("Erreur chargement enseignants :", error);
    }
  };

  const handleEdit = (matiere) => {
    setForm({
      id: matiere.id,
      nom: matiere.nom,
      credits: matiere.credits || "",
      enseignant_id: matiere.enseignant_id || "",
      semestre_id: matiere.semestre_id
    });
    setEditing(true);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validation côté client
      if (!form.nom || !form.semestre_id) {
        setSnackbar({
          open: true,
          message: "Le nom et le semestre sont obligatoires",
          severity: "error"
        });
        return;
      }
  
      const data = {
        nom: form.nom,
        credits: form.credits || null,
        enseignant_id: form.enseignant_id || null,
        semestre_id: form.semestre_id
      };
  
      if (editing) {
        const response = await axios.put(
          `http://localhost:5000/api/matieres/${form.id}`,
          data
        );
        
        if (response.data.success) {
          setSnackbar({
            open: true,
            message: response.data.message || "Matière mise à jour",
            severity: "success"
          });
        }
      } else {
        await axios.post("http://localhost:5000/api/matieres", data); // URL complète
        setSnackbar({ open: true, message: "Matière créée", severity: "success" });
      }
      
      fetchMatieres();
    setOpen(false);
  } catch (error) {
    console.error("Erreur détaillée:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    setSnackbar({
      open: true,
      message: error.response?.data?.message || "Erreur lors de l'opération",
      severity: "error"
    });
  }
};



  const handleConfirmDelete = (matiere) => {
    setSelectedToDelete(matiere);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/matieres/${selectedToDelete.id}`
      );
  
      if (response.data.success) {
        setMatieres(prev => prev.filter(m => m.id !== selectedToDelete.id));
        setSnackbar({
          open: true,
          message: response.data.message || 'Matière supprimée avec succès',
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
      console.error('Détails erreur:', {
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

  const filteredData = matieres.filter(m => 
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    (m.enseignant && m.enseignant.toLowerCase().includes(search.toLowerCase())) ||
    (m.semestre && m.semestre.toString().includes(search)) ||
    (m.classe && m.classe.toLowerCase().includes(search.toLowerCase()))
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
      <h2>Gestion des Matières</h2>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Rechercher par nom, enseignant ou semestre"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            setForm({ id: "", nom: "", credits: "", enseignant_id: "", semestre_id: "" });
            setEditing(false);
            setOpen(true);
          }}
        >
          Ajouter Matière
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Crédits</TableCell>
              <TableCell>Enseignant</TableCell>
              <TableCell>Semestre</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((matiere) => (
                <TableRow key={matiere.id}>
                  <TableCell>{matiere.id}</TableCell>
                  <TableCell>{matiere.nom}</TableCell>
                  <TableCell>{matiere.credits || "-"}</TableCell>
                  <TableCell>{matiere.enseignant || "Non assigné"}</TableCell>
                  <TableCell>{matiere.semestre || "-"}</TableCell>
                  <TableCell>{matiere.classe || "-"}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(matiere)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleConfirmDelete(matiere)}>
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
        <DialogTitle>{editing ? "Modifier Matière" : "Ajouter Matière"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la matière"
            fullWidth
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Crédits"
            type="number"
            fullWidth
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: e.target.value })}
            sx={{ mb: 2 }}
          />
         <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel id="semestre-select-label">Semestre</InputLabel>
  <Select
    labelId="semestre-select-label"
    value={form.semestre_id}
    label="Semestre"
    onChange={(e) => setForm({ ...form, semestre_id: e.target.value })}
  >
    {semestres.map((semestre) => (
      <MenuItem key={semestre.id} value={semestre.id}>
        {`Semestre ${semestre.numero} - ${semestre.classe_nom} (${semestre.filiere_nom})`}
      </MenuItem>
    ))}
  </Select>
</FormControl>
          <FormControl fullWidth>
            <InputLabel id="enseignant-select-label">Enseignant</InputLabel>
            <Select
              labelId="enseignant-select-label"
              value={form.enseignant_id}
              label="Enseignant"
              onChange={(e) => setForm({ ...form, enseignant_id: e.target.value })}
            >
              <MenuItem value="">Non assigné</MenuItem>
              {enseignants.map((enseignant) => (
                <MenuItem key={enseignant.Cin} value={enseignant.Cin}>
                  {enseignant.Nom_et_prénom}
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
            Êtes-vous sûr de vouloir supprimer la matière "{selectedToDelete?.nom}" ?
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

export default GestionMatieres;