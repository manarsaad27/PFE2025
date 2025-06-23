import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar, Typography,
  Divider, IconButton, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  GroupAdd as AddAgentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [openAgentDialog, setOpenAgentDialog] = useState(false);
  const [agentForm, setAgentForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    departement: 'Informatique',
    role: 'Agent'
  });

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleAddAgent = () => {
    console.log("Nouvel agent créé:", agentForm);
    setOpenAgentDialog(false);
    setAgentForm({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      departement: 'Informatique',
      role: 'Agent'
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      {/* Zone centrale */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none'
          }}
        >
          
        </AppBar>

        {/* Contenu dynamique */}
        <Box sx={{ p: 3, mt: 1 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Dialog Création Agent */}
      <Dialog open={openAgentDialog} onClose={() => setOpenAgentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un nouvel agent</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Nom" 
            margin="normal"
            value={agentForm.nom}
            onChange={(e) => setAgentForm({ ...agentForm, nom: e.target.value })}
          />
          <TextField 
            fullWidth 
            label="Prénom" 
            margin="normal"
            value={agentForm.prenom}
            onChange={(e) => setAgentForm({ ...agentForm, prenom: e.target.value })}
          />
          <TextField 
            fullWidth 
            label="Email" 
            type="email" 
            margin="normal"
            value={agentForm.email}
            onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
          />
          <TextField 
            fullWidth 
            label="Mot de passe" 
            type="password" 
            margin="normal"
            value={agentForm.password}
            onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
          />
          <TextField 
            fullWidth 
            select 
            label="Département" 
            margin="normal"
            value={agentForm.departement}
            onChange={(e) => setAgentForm({ ...agentForm, departement: e.target.value })}
          >
            <MenuItem value="Informatique">Informatique</MenuItem>
            <MenuItem value="Mathématiques">Mathématiques</MenuItem>
            <MenuItem value="Physique">Physique</MenuItem>
          </TextField>
          <TextField 
            fullWidth 
            select 
            label="Rôle" 
            margin="normal"
            value={agentForm.role}
            onChange={(e) => setAgentForm({ ...agentForm, role: e.target.value })}
          >
            <MenuItem value="Agent">Agent</MenuItem>
            <MenuItem value="Superviseur">Superviseur</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgentDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddAgent}>Créer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLayout;