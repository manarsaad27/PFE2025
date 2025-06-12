import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import InsightsIcon from '@mui/icons-material/Insights';
import { Grid } from '@mui/material';
import { Add as AddIcon, Publish as PublishIcon, GetApp as DownloadIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
const Emploi = () => {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';
  const [emplois, setEmplois] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: "etudiant",
    filiere_id: "",
    classe_id: "",
    semestre_id: "",
    enseignant_id: "",
    fichier: null
  });

  // Formatage de la date de diffusion
  const formatDateDiffusion = (dateString) => {
    if (!dateString) return <span style={{ fontStyle: 'italic', color: '#666' }}>Non publié</span>;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5;

    // Formatage différent selon l'ancienneté
    if (diffHours < 24) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Chargement des données initiales
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [emploisRes, filieresRes, classesRes, semestresRes, enseignantsRes] = await Promise.all([
        axios.get(`${API_URL}/emplois`),
        axios.get(`${API_URL}/filieres`),
        axios.get(`${API_URL}/classes`),
        axios.get(`${API_URL}/semestres`),
        axios.get(`${API_URL}/enseignants/list`)
      ]);

      // Validation des données
      const validatedSemestres = (semestresRes.data.data || []).map(s => ({
        ...s,
        classe_id: s.classe_id ? s.classe_id : null
      }));

      setEmplois(emploisRes.data.data || []);
      setFilieres(filieresRes.data.data || []);
      setClasses(classesRes.data.data || []);
      setSemestres(validatedSemestres);
      setEnseignants(enseignantsRes.data.data || []);

    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
   

// Add useEffect to load semesters when class changes
useEffect(() => {
  const fetchSemesters = async () => {
    if (formData.classe_id) {
      try {
        const response = await axios.get(`${API_URL}/semestres?classe_id=${formData.classe_id}`);
        setSemestres(response.data.data);
      } catch (err) {
        console.error("Erreur chargement semestres:", err);
      }
    }
  };
  
  fetchSemesters();
}, [formData.classe_id]);

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "filiere_id" && { classe_id: "", semestre_id: "" }),
      ...(name === "classe_id" && { semestre_id: "" })
    }));
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, fichier: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.fichier) {
        setError("Veuillez sélectionner un fichier");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('fichier', formData.fichier);

      if (formData.type === 'etudiant') {
        if (!formData.filiere_id || !formData.classe_id || !formData.semestre_id) {
          setError("Veuillez remplir tous les champs pour un emploi étudiant");
          return;
        }
        formDataToSend.append('filiere_id', formData.filiere_id);
        formDataToSend.append('classe_id', formData.classe_id);
        formDataToSend.append('semestre_id', formData.semestre_id);
      } else {
        if (!formData.enseignant_id) {
          setError("Veuillez sélectionner un enseignant");
          return;
        }
        formDataToSend.append('enseignant_id', formData.enseignant_id);
      }

      await axios.post(`${API_URL}/emplois`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess("Emploi du temps ajouté avec succès");
      setOpenDialog(false);
      setFormData({
        type: "etudiant",
        filiere_id: "",
        classe_id: "",
        semestre_id: "",
        enseignant_id: "",
        fichier: null
      });

      // Rafraîchir la liste
      const response = await axios.get(`${API_URL}/emplois`);
      setEmplois(response.data.data || []);

    } catch (err) {
      console.error("Erreur:", err);
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const getNom = (id, collection) => {
    const item = collection.find(item => item.id == id);
    return item ? item.nom : "-";
  };

  const handleDownload = (id) => {
    window.open(`${API_URL}/emplois/${id}/download`, "_blank");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/emplois/${id}`);
      setEmplois(emplois.filter(emploi => emploi.id !== id));
      setSuccess("Emploi supprimé avec succès");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la suppression");
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.put(`${API_URL}/emplois/${id}/publish`);
      setEmplois(emplois.map(emploi => 
        emploi.id === id ? { ...emploi, published: true, published_at: new Date().toISOString() } : emploi
      ));
      setSuccess("Emploi publié avec succès");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la publication");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button 
    startIcon={<ArrowBack />} 
    onClick={() => navigate('/admin/dashboard')} 
    sx={{ mb: 2 }}
  >
    Retour
  </Button>
      <Typography variant="h4" gutterBottom>
        Gestion des emplois du temps
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Ajouter un emploi
      </Button>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Filière</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Semestre</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Date de diffusion</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emplois.map(emploi => (
              <TableRow key={emploi.id} hover>
                <TableCell>{emploi.type === 'etudiant' ? 'Étudiants' : 'Enseignant'}</TableCell>
                <TableCell>{emploi.filiere_id ? getNom(emploi.filiere_id, filieres) : '-'}</TableCell>
                <TableCell>{emploi.classe_id ? getNom(emploi.classe_id, classes) : '-'}</TableCell>
                <TableCell>
                  {emploi.semestre_id ? `S${semestres.find(s => s.id == emploi.semestre_id)?.numero || '?'}` : '-'}
                </TableCell>
                <TableCell>
                  {emploi.published ? (
                    <span style={{ color: 'green' }}>Publié</span>
                  ) : (
                    <span style={{ color: 'orange' }}>Brouillon</span>
                  )}
                </TableCell>
                <TableCell>
                  {formatDateDiffusion(emploi.published_at)}
                </TableCell>
                <TableCell>
                  <Button 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(emploi.id)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Télécharger
                  </Button>
                  {!emploi.published && (
                    <>
                      <Button
                        startIcon={<PublishIcon />}
                        onClick={() => handlePublish(emploi.id)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Publier
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(emploi.id)}
                        size="small"
                        color="error"
                      >
                        Supprimer
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulaire d'ajout */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un nouvel emploi du temps</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Type d'emploi</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Type d'emploi"
              >
                <MenuItem value="etudiant">Emploi étudiant</MenuItem>
                <MenuItem value="enseignant">Emploi enseignant</MenuItem>
              </Select>
            </FormControl>

            {formData.type === 'enseignant' ? (
              <FormControl fullWidth>
                <InputLabel>Enseignant</InputLabel>
                <Select
                  name="enseignant_id"
                  value={formData.enseignant_id}
                  onChange={handleInputChange}
                  label="Enseignant"
                  required
                >
                  <MenuItem value="">Sélectionnez un enseignant</MenuItem>
                  {enseignants.map(enseignant => (
                    <MenuItem key={enseignant.CIN} value={enseignant.CIN}>
                      {enseignant.Nom_et_prénom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel>Filière</InputLabel>
                  <Select
                    name="filiere_id"
                    value={formData.filiere_id}
                    onChange={handleInputChange}
                    label="Filière"
                    required
                  >
                    <MenuItem value="">Sélectionnez une filière</MenuItem>
                    {filieres.map(filiere => (
                      <MenuItem key={filiere.id} value={filiere.id}>
                        {filiere.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!formData.filiere_id}>
                  <InputLabel>Classe</InputLabel>
                  <Select
                    name="classe_id"
                    value={formData.classe_id}
                    onChange={handleInputChange}
                    label="Classe"
                    required
                  >
                    <MenuItem value="">Sélectionnez une classe</MenuItem>
                    {classes
                      .filter(classe => classe.filiere_id == formData.filiere_id)
                      .map(classe => (
                        <MenuItem key={classe.id} value={classe.id}>
                          {classe.nom}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

<FormControl fullWidth>
  <InputLabel id="semestre-label">Semestre</InputLabel>
  <Select
    labelId="semestre-label"
    name="semestre_id"
    value={formData.semestre_id}
    onChange={handleInputChange}
    label="Semestre"
    disabled={!formData.classe_id}
  >
    <MenuItem value="" disabled>
      {formData.classe_id 
        ? semestres.filter(s => s.classe_id == formData.classe_id).length === 0
          ? "Aucun semestre disponible"
          : "Sélectionnez un semestre"
        : "Sélectionnez d'abord une classe"}
    </MenuItem>

    {semestres
      .filter(semestre => semestre.classe_id == formData.classe_id)
      .map(semestre => (
        <MenuItem key={semestre.id} value={semestre.id}>
          Semestre {semestre.numero}
        </MenuItem>
      ))}
  </Select>
</FormControl>

              </>
            )}

            <Button variant="contained" component="label" startIcon={<PublishIcon />}>
              Sélectionner le fichier
              <input type="file" hidden onChange={handleFileChange} accept=".pdf,.xlsx,.xls" />
            </Button>
            {formData.fichier && (
              <Typography variant="body2">Fichier sélectionné: {formData.fichier.name}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading || !formData.fichier || 
              (formData.type === 'etudiant' && (!formData.filiere_id || !formData.classe_id || !formData.semestre_id)) ||
              (formData.type === 'enseignant' && !formData.enseignant_id)
            }
          >
            {loading ? <CircularProgress size={24} /> : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Emploi;