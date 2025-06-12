import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';

const GestionCours = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    { id: 1, nom: 'Algorithmique', code: 'INF101', niveau: 'Licence 1', responsable: 'Prof. Dupont' },
    { id: 2, nom: 'Base de données', code: 'INF201', niveau: 'Licence 2', responsable: 'Prof. Martin' },
    { id: 3, nom: 'Intelligence Artificielle', code: 'INF301', niveau: 'Master 1', responsable: 'Prof. Smith' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({ nom: '', code: '', niveau: '', responsable: '' });

  const handleOpenDialog = (course = { nom: '', code: '', niveau: '', responsable: '' }) => {
    setCurrentCourse(course);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (currentCourse.id) {
      setCourses(courses.map(c => (c.id === currentCourse.id ? currentCourse : c)));
    } else {
      const newId = courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1;
      setCourses([...courses, { ...currentCourse, id: newId }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>Gestion des Cours</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Ajouter un cours
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.nom}</TableCell>
                <TableCell><Chip label={course.code} color="primary" /></TableCell>
                <TableCell>{course.niveau}</TableCell>
                <TableCell>{course.responsable}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(course)}><Edit color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(course.id)}><Delete color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentCourse?.id ? 'Modifier le cours' : 'Ajouter un cours'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Nom du cours" name="nom" value={currentCourse.nom} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Code" name="code" value={currentCourse.code} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Niveau" name="niveau" value={currentCourse.niveau} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Responsable" name="responsable" value={currentCourse.responsable} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">{currentCourse?.id ? 'Modifier' : 'Ajouter'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionCours;
