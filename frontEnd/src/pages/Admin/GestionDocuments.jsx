import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowBack, GetApp, Delete, Edit, Add, CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';

const DocumentsAdmin = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: 'emploi',
    titre: '',
    description: '',
    filiere_id: '',
    classe_id: '',
    semestre_id: '',
    matiere_id: '',
    date: '',
    fichier: null
  });
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [matieres, setMatieres] = useState([]);

  // Types de documents
  const documentTypes = [
    { value: 'emploi', label: 'Emploi du temps' },
    { value: 'examen', label: 'Examen' },
    { value: 'cours', label: 'Cours' },
    { value: 'td', label: 'Travaux Dirigés' },
    { value: 'tp', label: 'Travaux Pratiques' },
    { value: 'evenement', label: 'Événement' },
    { value: 'autre', label: 'Autre' }
  ];

  // Charger tous les documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/documents/all');
      setDocuments(response.data.data || []);
    } catch (err) {
      setError("Erreur lors du chargement des documents");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données de référence
  const fetchReferenceData = async () => {
    try {
      const [filieresRes] = await Promise.all([
        axios.get('http://localhost:5000/api/filieres')
      ]);
      setFilieres(filieresRes.data.data || []);
    } catch (err) {
      console.error("Erreur chargement données référence:", err);
    }
  };

  // Charger les classes par filière
  const fetchClasses = async (filiereId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/filieres/${filiereId}/classes`);
      setClasses(response.data.data || []);
    } catch (err) {
      console.error("Erreur chargement classes:", err);
    }
  };

  // Charger les semestres par classe
  const fetchSemestres = async (classeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/classes/${classeId}/semestres`);
      setSemestres(response.data.data || []);
    } catch (err) {
      console.error("Erreur chargement semestres:", err);
    }
  };

  // Charger les matières par semestre
  const fetchMatieres = async (semestreId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/semestres/${semestreId}/matieres`);
      setMatieres(response.data.data || []);
    } catch (err) {
      console.error("Erreur chargement matières:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchReferenceData();
  }, []);

  const handleOpenDialog = (doc = null) => {
    if (doc) {
      setCurrentDoc(doc);
      setFormData({
        type: doc.type,
        titre: doc.titre || '',
        description: doc.description || '',
        filiere_id: doc.filiere_id || '',
        classe_id: doc.classe_id || '',
        semestre_id: doc.semestre_id || '',
        matiere_id: doc.matiere_id || '',
        date: doc.date || '',
        fichier: null
      });

      // Charger les données hiérarchiques si nécessaire
      if (doc.filiere_id) fetchClasses(doc.filiere_id);
      if (doc.classe_id) fetchSemestres(doc.classe_id);
      if (doc.semestre_id) fetchMatieres(doc.semestre_id);
    } else {
      setCurrentDoc(null);
      setFormData({
        type: 'emploi',
        titre: '',
        description: '',
        filiere_id: '',
        classe_id: '',
        semestre_id: '',
        matiere_id: '',
        date: '',
        fichier: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Gérer les dépendances entre les sélecteurs
    if (name === 'filiere_id') {
      fetchClasses(value);
      setFormData(prev => ({ ...prev, classe_id: '', semestre_id: '', matiere_id: '' }));
    } else if (name === 'classe_id') {
      fetchSemestres(value);
      setFormData(prev => ({ ...prev, semestre_id: '', matiere_id: '' }));
    } else if (name === 'semestre_id') {
      fetchMatieres(value);
      setFormData(prev => ({ ...prev, matiere_id: '' }));
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, fichier: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      if (formData.filiere_id) formDataToSend.append('filiere_id', formData.filiere_id);
      if (formData.classe_id) formDataToSend.append('classe_id', formData.classe_id);
      if (formData.semestre_id) formDataToSend.append('semestre_id', formData.semestre_id);
      if (formData.matiere_id) formDataToSend.append('matiere_id', formData.matiere_id);
      if (formData.date) formDataToSend.append('date', formData.date);
      if (formData.fichier) formDataToSend.append('fichier', formData.fichier);

      if (currentDoc) {
        await axios.put(`http://localhost:5000/api/documents/${currentDoc.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Document mis à jour avec succès');
      } else {
        await axios.post('http://localhost:5000/api/documents', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Document ajouté avec succès');
      }

      fetchDocuments();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'opération");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      setSuccess('Document supprimé avec succès');
    } catch (err) {
      setError("Erreur lors de la suppression");
      console.error("Erreur:", err);
    }
  };

  const handleDownload = (id, filename) => {
    window.open(`http://localhost:5000/api/documents/${id}/download`, '_blank');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emploi': return 'primary';
      case 'examen': return 'error';
      case 'cours': return 'success';
      case 'td': return 'warning';
      case 'tp': return 'info';
      case 'evenement': return 'secondary';
      default: return 'default';
    }
  };

  const getNom = (id, collection) => {
    const item = collection.find(item => item.id == id);
    return item ? item.nom : '-';
  };

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filter);

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>
        Gestion des Documents
      </Typography>

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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par type</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filtrer par type"
          >
            <MenuItem value="all">Tous les types</MenuItem>
            {documentTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Ajouter un document
        </Button>
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Filière</TableCell>
                <TableCell>Classe</TableCell>
                <TableCell>Semestre</TableCell>
                <TableCell>Matière</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Chip 
                      label={documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                      color={getTypeColor(doc.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{doc.titre}</TableCell>
                  <TableCell>{doc.description || '-'}</TableCell>
                  <TableCell>{getNom(doc.filiere_id, filieres)}</TableCell>
                  <TableCell>{getNom(doc.classe_id, classes)}</TableCell>
                  <TableCell>
                    {doc.semestre_id ? `S${semestres.find(s => s.id == doc.semestre_id)?.numero || '?'}` : '-'}
                  </TableCell>
                  <TableCell>{getNom(doc.matiere_id, matieres)}</TableCell>
                  <TableCell>{doc.date ? moment(doc.date).format('DD/MM/YYYY') : '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDownload(doc.id, doc.fichier_nom)}>
                      <GetApp color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDialog(doc)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(doc.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentDoc ? 'Modifier un document' : 'Ajouter un nouveau document'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type de document</InputLabel>
              <Select
                label="Type de document"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {documentTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Titre"
              name="titre"
              value={formData.titre}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Filière</InputLabel>
              <Select
                label="Filière"
                name="filiere_id"
                value={formData.filiere_id}
                onChange={handleInputChange}
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
                label="Classe"
                name="classe_id"
                value={formData.classe_id}
                onChange={handleInputChange}
              >
                <MenuItem value="">Sélectionnez une classe</MenuItem>
                {classes.map(classe => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!formData.classe_id}>
              <InputLabel>Semestre</InputLabel>
              <Select
                label="Semestre"
                name="semestre_id"
                value={formData.semestre_id}
                onChange={handleInputChange}
              >
                <MenuItem value="">Sélectionnez un semestre</MenuItem>
                {semestres.map(semestre => (
                  <MenuItem key={semestre.id} value={semestre.id}>
                    Semestre {semestre.numero}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!formData.semestre_id}>
              <InputLabel>Matière</InputLabel>
              <Select
                label="Matière"
                name="matiere_id"
                value={formData.matiere_id}
                onChange={handleInputChange}
              >
                <MenuItem value="">Sélectionnez une matière (optionnel)</MenuItem>
                {matieres.map(matiere => (
                  <MenuItem key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Date (si applicable)"
              name="date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={handleInputChange}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
            >
              {formData.fichier?.name || "Téléverser le fichier"}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            {currentDoc?.fichier_nom && !formData.fichier && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Fichier actuel: {currentDoc.fichier_nom}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading || !formData.titre || !formData.type}
          >
            {loading ? <CircularProgress size={24} /> : currentDoc ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsAdmin;