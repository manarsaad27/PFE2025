import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, DialogContentText, IconButton,
  Select, MenuItem, InputLabel, FormControl, Box, Typography, Collapse
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const GestionMatieres = () => {
  const navigate = useNavigate();
  const [matieres, setMatieres] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classes, setClasses] = useState([]);
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [expandedClasses, setExpandedClasses] = useState({});

  useEffect(() => {
    fetchMatieres();
    fetchSemestres();
    fetchEnseignants();
    fetchClasses();
  }, []);

  const fetchMatieres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matieres");
      setMatieres(res.data.data || res.data);
      const initialExpanded = {};
      res.data.data.forEach(matiere => {
        if (matiere.classe_nom) {
          initialExpanded[matiere.classe_nom] = true;
        }
      });
      setExpandedClasses(initialExpanded);
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
      setClasses(res.data.data || res.data);
    } catch (error) {
      console.error("Erreur chargement classes:", error);
    }
  };

  const fetchSemestres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/semestres");
      console.log("Semestres chargés:", res.data); 
      setSemestres(res.data.data || []); 
    } catch (error) {
      console.error("Erreur chargement semestres:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des semestres",
        severity: "error"
      });
      setSemestres([]); 
    }
  };

  const fetchEnseignants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/utilisateurs");
      setEnseignants(res.data.filter(u => u.role === "enseignant"));
    } catch (error) {
      console.error("Erreur chargement enseignants:", error);
    }
  };

  const formatSemestre = (matiere) => {
    if (!matiere) return "Non défini";
    
    if (matiere.semestre_numero) {
      return `Semestre ${matiere.semestre_numero}`;
    }
    
    if (matiere.semestre_data?.numero) {
      return `Semestre ${matiere.semestre_data.numero}`;
    }
    
    if (matiere.semestre_id) {
      const semestre = semestres.find(s => s.id === matiere.semestre_id);
      return semestre ? `Semestre ${semestre.numero}` : `ID ${matiere.semestre_id}`;
    }
    
    return "Semestre non spécifié";
  };

  const matieresParClasse = matieres.reduce((acc, matiere) => {
    const classeNom = matiere.classe_nom || 'Non classé';
    if (!acc[classeNom]) {
      acc[classeNom] = [];
    }
    acc[classeNom].push(matiere);
    return acc;
  }, {});

  const classesTriees = Object.keys(matieresParClasse)
    .sort((a, b) => a.localeCompare(b))
    .map(classeNom => ({
      classeNom,
      matieres: matieresParClasse[classeNom].sort((a, b) => {
        const semestreA = a.semestre_numero || semestres.find(s => s.id === a.semestre_id)?.numero || 0;
        const semestreB = b.semestre_numero || semestres.find(s => s.id === b.semestre_id)?.numero || 0;
        
        if (semestreA !== semestreB) {
          return semestreA - semestreB;
        }
        return a.nom.localeCompare(b.nom);
      })
    }));

  const handleToggleClasse = (classeNom) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classeNom]: !prev[classeNom]
    }));
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
         ` http://localhost:5000/api/matieres/${form.id}`,
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
        await axios.post("http://localhost:5000/api/matieres", data);
        setSnackbar({ open: true, message: "Matière créée", severity: "success" });
      }
      
      fetchMatieres();
      setOpen(false);
    } catch (error) {
      console.error("Erreur détaillée:", error.response?.data || error.message);
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
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la suppression',
        severity: 'error'
      });
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <div style={{ padding: "0 2rem 2rem 2rem", margin: 0 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/agent/dashboard')} 
        sx={{ mb: 2 }}
      >
        Retour
      </Button>
      <h2>Gestion des Matières</h2>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Rechercher par nom, enseignant ou classe"
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
              <TableCell>Classe</TableCell>
              <TableCell>Matières</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classesTriees.map(({ classeNom, matieres }) => (
              <React.Fragment key={classeNom}>
                <TableRow hover onClick={() => handleToggleClasse(classeNom)} style={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {expandedClasses[classeNom] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {classeNom}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary">
                      {matieres.length} matière(s)
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
                    <Collapse in={expandedClasses[classeNom]} timeout="auto" unmountOnExit>
                      <Table size="small" sx={{ margin: 1 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nom</TableCell>
                            <TableCell>Crédits</TableCell>
                            <TableCell>Enseignant</TableCell>
                            <TableCell>Semestre</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {matieres.map((matiere) => (
                            <TableRow key={matiere.id}>
                              <TableCell>{matiere.id}</TableCell>
                              <TableCell>{matiere.nom}</TableCell>
                              <TableCell>{matiere.credits || "-"}</TableCell>
                              <TableCell>{matiere.enseignant || "Non assigné"}</TableCell>
                              <TableCell>
                                {formatSemestre(matiere)}
                              </TableCell>
                              <TableCell>
                                <IconButton color="primary" onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(matiere);
                                }}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmDelete(matiere);
                                }}>
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
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
              {semestres.map((semestre) => {
                const classe = classes.find(c => c.id === semestre.classe_id);
                return (
                  <MenuItem key={semestre.id} value={semestre.id}>
                    {`Semestre ${semestre.numero}${classe ? ` - ${classe.nom}` : ''}`}
                  </MenuItem>
                );
              })}
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