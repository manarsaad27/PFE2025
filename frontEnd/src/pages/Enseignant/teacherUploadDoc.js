import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Card, List, ListItem, ListItemText, TextField, Typography,
  Select, MenuItem, FormControl, InputLabel, IconButton, 
  Snackbar, Alert, Chip, Divider, CircularProgress, Box,
  Badge, Popover
} from '@mui/material';
import {
  Upload as UploadIcon, Edit, Delete, Download as DownloadIcon,
  Notifications as NotificationsIcon, Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import styled from 'styled-components';
import { jwtDecode } from 'jwt-decode';
import logoFac from './../../assets/logoFac.png';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

const StyledCard = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

const TeacherHeader = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const anchorEl = React.useRef(null);
  const token = localStorage.getItem('teacherToken');

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications', {
        params: { audience: 'enseignants' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (data.success) {
        const formattedNotifications = data.notifications.map(notif => ({
          id: notif.id,
          title: notif.title || "Notification",
          message: notif.message,
          read_status: notif.read_status || false,
          created_at: notif.created_at
        }));
        
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read_status).length);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  const handleToggleNotifications = () => {
    setOpen(!open);
    if (!open) loadNotifications();
  };

  const handleCloseNotifications = () => setOpen(false);

  const markAsRead = async (id) => {
    try {
      await api.patch('/api/enseignant/notifications', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read_status: true } : n
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherCin');
    window.location.href = '/connexion';
  };

  return (
    <header style={{ 
      display: "flex", 
      alignItems: "center", 
      padding: "1rem 5%", 
      backgroundColor: "#fff", 
      borderBottom: "1px solid #e0e0e0", 
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)", 
      position: "sticky", 
      top: 0, 
      zIndex: 1000 
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <img src={logoFac} width="80" height="80" alt="Logo Faculté" style={{ marginRight: "1rem" }} />
        <div style={{ borderLeft: "2px solid #0056b3", paddingLeft: "1rem" }}>
          <Typography variant="h6" style={{ color: "#0056b3", fontWeight: "bold" }}>
            Faculté des Sciences et Techniques FSTSBZ
          </Typography>
          <Typography variant="subtitle2" style={{ color: "#555" }}>
            Université de Kairouan
          </Typography>
        </div>
      </a>
      <div style={{ flexGrow: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <IconButton ref={anchorEl} onClick={handleToggleNotifications} style={{ color: '#0056b3' }}>
          <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Popover
          open={open}
          anchorEl={anchorEl.current}
          onClose={handleCloseNotifications}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ style: { width: 400, maxHeight: '70vh', padding: '1rem', borderRadius: '10px' } }}
        >
          <Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Typography variant="h6" style={{ color: '#0056b3' }}>Notifications</Typography>
              <IconButton onClick={handleCloseNotifications} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider style={{ marginBottom: '1rem' }} />
            {notifications.length === 0 ? (
              <Typography variant="body2" style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
                Aucune notification pour le moment
              </Typography>
            ) : (
              <List dense>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id || index}>
                    <ListItem
                      style={{ backgroundColor: notification.read_status ? 'inherit' : 'rgba(0, 86, 179, 0.05)' }}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <ListItemText
                        primary={<Typography variant="subtitle2" style={{ color: '#0056b3' }}>{notification.title}</Typography>}
                        secondary={notification.message}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Popover>

        
      </div>
    </header>
  );
};

const TeacherDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [teachingData, setTeachingData] = useState({
    filieres: [], classes: [], matieres: [], semestres: []
  });
  const [loading, setLoading] = useState(true);
  const [newDoc, setNewDoc] = useState({
    title: '',
    enseignant_id: JSON.parse(localStorage.getItem("teacherCin")),
    filiere_id: '',
    classe_id: '',
    matiere_id: '',
    diffusionDate: new Date(),
    file: null
  });
  const [darkMode, setDarkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
    if (token) {
      const decoded = jwtDecode(token);
      setNewDoc(prev => ({...prev, enseignant_id: decoded.cin}));
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teaching-data');
        setTeachingData({
          filieres: response.data.data.filieres || [],
          classes: response.data.data.classes || [],
          matieres: response.data.data.matieres || [],
          semestres: response.data.data.semestres || []
        });
        fetchDocuments();
      } catch (error) {
        console.error("Erreur:", error);
        setSnackbar({ open: true, message: "Erreur lors du chargement des données", severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f8f9fa',
    textColor: darkMode ? '#ffffff' : '#000000',
    cardBg: darkMode ? '#2d2d2d' : '#ffffff',
    textSecondary: darkMode ? '#bbbbbb' : '#555555',
    borderColor: darkMode ? '#444444' : '#e0e0e0',
    primaryColor: darkMode ? '#4a8fd2' : '#0056b3',
    inputBg: darkMode ? '#3d3d3d' : '#ffffff',
    inputBorder: darkMode ? '#555555' : '#dddddd'
  };

  const handleFiliereChange = (e) => {
    setNewDoc({
      ...newDoc,
      filiere_id: e.target.value,
      classe_id: '',
      matiere_id: ''
    });
  };

  const handleClasseChange = (e) => {
    setNewDoc({
      ...newDoc,
      classe_id: e.target.value,
      matiere_id: ''
    });
  };

  const handleFileChange = (e) => {
    setNewDoc({...newDoc, file: e.target.files[0]});
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newDoc.title);
      formData.append('enseignant_id', newDoc.enseignant_id);
      formData.append('filiere_id', newDoc.filiere_id);
      formData.append('classe_id', newDoc.classe_id);
      formData.append('matiere_id', newDoc.matiere_id);
      formData.append("date_diffusion", newDoc.diffusionDate?.toISOString().split("T")[0]);
      formData.append('file', newDoc.file);
      
      const response = await axios.post('http://localhost:5000/api/diffuseCours', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: 'Document publié avec succès!', severity: 'success' });
        resetForm();
        fetchDocuments();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors de la publication",
        severity: 'error'
      });
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/api/enseignant/documents/${newDoc.enseignant_id}`);
      setDocuments(response.data.data);
    } catch (error) {
      console.error("Erreur:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors du chargement",
        severity: "error"
      });
    }
  };

  const downloadFile = async (id, fileName) => {
    try {
      const response = await api.get(`/api/documents/${id}/download`, { 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du téléchargement",
        severity: "error"
      });
    }
  };

  
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token'); 
      const cin = localStorage.getItem('teacherCin');
      
      if (!token || !cin) {
        throw new Error("Veuillez vous reconnecter - Session expirée");
      }
  
      const response = await api.delete(`/api/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        setSnackbar({
          open: true,
          message: "Document supprimé avec succès",
          severity: "success"
        });
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Échec de la suppression",
        severity: "error"
      });
    }
  };

  const resetForm = () => {
    setNewDoc({
      title: '',
      enseignant_id: newDoc.enseignant_id,
      filiere_id: '',
      classe_id: '',
      matiere_id: '',
      diffusionDate: new Date(),
      file: null
    });
  };

  const handleCloseSnackbar = () => setSnackbar({...snackbar, open: false});

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: themeStyles.backgroundColor,
      color: themeStyles.textColor
    }}>
      <TeacherHeader />
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
          <StyledCard style={{ padding: '32px', marginBottom: '40px' }}>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '32px' }}>
              <Edit sx={{ mr: 1, color: themeStyles.primaryColor }} /> Publier une nouvelle ressource
            </Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <TextField
                label="Titre du document"
                fullWidth
                value={newDoc.title}
                onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: themeStyles.textSecondary },
                  '& .MuiInputBase-input': { color: themeStyles.textColor },
                  backgroundColor: themeStyles.inputBg
                }}
              />
             
              <DatePicker
                label="Date de diffusion"
                value={newDoc.diffusionDate}
                onChange={(date) => setNewDoc({...newDoc, diffusionDate: date})}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiInputLabel-root': { color: themeStyles.textSecondary },
                      '& .MuiInputBase-input': { color: themeStyles.textColor },
                      backgroundColor: themeStyles.inputBg
                    }
                  }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel sx={{ color: themeStyles.textSecondary }}>Filière</InputLabel>
                <Select
                  value={newDoc.filiere_id}
                  label="Filière"
                  onChange={handleFiliereChange}
                  sx={{
                    '& .MuiSelect-select': { color: themeStyles.textColor },
                    backgroundColor: themeStyles.inputBg
                  }}
                >
                  {teachingData.filieres.map((filiere) => (
                    <MenuItem key={filiere.id} value={filiere.id}>{filiere.nom}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: themeStyles.textSecondary }}>Classe</InputLabel>
                <Select
                  value={newDoc.classe_id}
                  label="Classe"
                  onChange={handleClasseChange}
                  disabled={!newDoc.filiere_id}
                  sx={{
                    '& .MuiSelect-select': { color: themeStyles.textColor },
                    backgroundColor: themeStyles.inputBg
                  }}
                >
                  {teachingData.classes
                    .filter(classe => classe.filiere_id === newDoc.filiere_id)
                    .map(classe => (
                      <MenuItem key={classe.id} value={classe.id}>{classe.nom}</MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
  <InputLabel sx={{ color: themeStyles.textSecondary }}>Matière</InputLabel>
  <Select
    value={newDoc.matiere_id}
    label="Matière"
    onChange={(e) => setNewDoc({...newDoc, matiere_id: e.target.value})}
    disabled={!newDoc.classe_id}
    sx={{
      '& .MuiSelect-select': { color: themeStyles.textColor },
      backgroundColor: themeStyles.inputBg
    }}
  >
    {teachingData.matieres
      .filter(matiere => {
        const semestre = teachingData.semestres.find(s => s.id === matiere.semestre_id);
        return semestre && semestre.classe_id.toString() === newDoc.classe_id.toString();
      })
      .map(matiere => {
        const semestre = teachingData.semestres.find(s => s.id === matiere.semestre_id);
        return (
          <MenuItem key={matiere.id} value={matiere.id}>
            {matiere.nom} - S ({semestre?.numero})
          </MenuItem>
        );
      })}
  </Select>
</FormControl>
            </div>

            <Divider sx={{ my: 3, backgroundColor: themeStyles.borderColor }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                style={{ display: 'none' }}
                id="upload-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ backgroundColor: themeStyles.primaryColor }}
                >
                  Sélectionner un fichier
                </Button>
              </label>
              
              {newDoc.file && (
                <Chip
                  label={newDoc.file.name}
                  onDelete={() => setNewDoc({...newDoc, file: null})}
                  variant="outlined"
                  sx={{
                    color: themeStyles.textColor,
                    borderColor: themeStyles.primaryColor
                  }}
                />
              )}
            </div>

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                mt: 2,
                backgroundColor: themeStyles.primaryColor,
                '&:disabled': { backgroundColor: darkMode ? '#555555' : '#e0e0e0' }
              }}
              disabled={!newDoc.file || !newDoc.title || !newDoc.matiere_id}
            >
              Publier
            </Button>
          </StyledCard>

          <Typography variant="h5" style={{ margin: '40px 0 24px 0' }}>
            Mes ressources publiées
          </Typography>
          
          {documents.length === 0 ? (
  <Typography variant="body1" sx={{ color: themeStyles.textSecondary }}>
    Aucun document publié pour le moment
  </Typography>
) : (
  <List>
    {documents.map((doc) => (
      <Card key={doc.id} style={{ marginBottom: '16px', backgroundColor: themeStyles.cardBg }}>
        <ListItem>
          <ListItemText
            primary={<Typography sx={{ color: themeStyles.textColor }}>{doc.title}</Typography>}
            secondary={
              <>
                <div style={{ color: themeStyles.textSecondary }}>
                  {doc.filiere_nom} - {doc.classe_nom} - {doc.matiere_nom}
                </div>
                <div style={{ color: themeStyles.textSecondary }}>
                  Publié le {doc.diffusion_date} | 
                  {doc.file_type} ({Math.round(doc.file_size / 1024)} KB)
                </div>
                <div style={{ color: themeStyles.textSecondary }}>
                  Fichier: {doc.file_name}
                </div>
              </>
            }
          />
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => downloadFile(doc.id, doc.file_name)}
            sx={{ color: themeStyles.primaryColor }}
          >
            Télécharger
          </Button>
          <IconButton onClick={() => handleDelete(doc.id)} sx={{ color: '#ff6b6b' }}>
            <Delete />
          </IconButton>
        </ListItem>
      </Card>
    ))}
  </List>
)}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default TeacherDocuments;