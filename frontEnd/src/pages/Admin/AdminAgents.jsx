import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as DepartmentIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  PersonOutline as AgentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
// En haut de votre AdminAgents.jsx
axios.defaults.baseURL = 'http://localhost:5000';
const AdminAgents = () => {
   const navigate = useNavigate();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    departement: 'Informatique',
    role: 'Agent'
  });

  const departements = [
    'Informatique',
    'Mathématiques',
    'Physique',
    'Chimie',
    'Biologie',
    'Administration'
  ];

  const roles = [
    { value: 'Agent', label: 'Agent', icon: <AgentIcon /> },
    { value: 'Superviseur', label: 'Superviseur', icon: <SupervisorIcon /> },
    { value: 'Administrateur', label: 'Administrateur', icon: <AdminIcon /> }
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
  try {
    const response = await axios.get('/agents'); // Pointe maintenant vers http://localhost:5000/agents
    setAgents(response.data.data);
  } catch (error) {
    toast.error('Erreur lors du chargement des agents');
    console.error(error);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAgent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/agents', newAgent);
      toast.success('Agent créé avec succès');
      setOpenDialog(false);
      setNewAgent({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        departement: 'Informatique',
        role: 'Agent'
      });
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/agents/${id}`);
      toast.success('Agent supprimé avec succès');
      fetchAgents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrateur': return 'primary';
      case 'Superviseur': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrateur': return <AdminIcon fontSize="small" />;
      case 'Superviseur': return <SupervisorIcon fontSize="small" />;
      default: return <AgentIcon fontSize="small" />;
    }
  };


useEffect(() => {
  axios.get('/agents')
    .then((res) => {
      setAgents(res.data);
    })
    .catch((err) => {
      console.error('Erreur lors du chargement des agents', err);
    });
}, []);



  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Button 
    startIcon={<ArrowBack />} 
    onClick={() => navigate('/admin/dashboard')} 
    sx={{ mb: 2 }}
  >
    Retour
  </Button>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Gestion des Agents Administratifs
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ mb: 3 }}
          >
            Ajouter un Agent
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(agents) && agents.length > 0 ? (
  agents.map((agent) => (
    <TableRow key={agent.id}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
            {getRoleIcon(agent.role)}
          </Avatar>
          <Typography variant="body1" fontWeight="medium">
            {agent.prenom} {agent.nom}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {agent.email}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DepartmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {agent.departement}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={agent.role}
          color={getRoleColor(agent.role)}
          size="small"
          icon={getRoleIcon(agent.role)}
          variant="outlined"
          sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
        />
      </TableCell>
      <TableCell>
        <IconButton
          color="error"
          onClick={() => handleDelete(agent.id)}
          aria-label={`Supprimer ${agent.prenom} ${agent.nom}`}
          title={`Supprimer ${agent.prenom} ${agent.nom}`}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))
) : (
  <TableRow>
    <TableCell colSpan={5} align="center">
      <Typography variant="body2" color="text.secondary">
        Aucun agent à afficher.
      </Typography>
    </TableCell>
  </TableRow>
)}

              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Dialog pour ajouter un nouvel agent */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un nouvel Agent</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={newAgent.nom}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={newAgent.prenom}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newAgent.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={newAgent.password}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Département"
                name="departement"
                value={newAgent.departement}
                onChange={handleInputChange}
                margin="normal"
                required
              >
                {departements.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Rôle"
                name="role"
                value={newAgent.role}
                onChange={handleInputChange}
                margin="normal"
                required
              >
                {roles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon}
                      <span style={{ marginLeft: 8 }}>{option.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!newAgent.nom || !newAgent.prenom || !newAgent.email || !newAgent.password}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminAgents;