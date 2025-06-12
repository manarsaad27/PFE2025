import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, Avatar,
  Divider, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemIcon, ListItemText, Chip, MenuItem, Paper,
  Menu
} from '@mui/material';

import {
  Menu as MenuIcon,
  Person as ProfileIcon,
  GroupAdd as AddAgentIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Verified as VerifiedIcon,
  Business as DepartmentIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

import { useTheme, alpha } from '@mui/material/styles';

const drawerWidth = 340;

const AdminLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [openAgentDialog, setOpenAgentDialog] = useState(false);
  const [agentForm, setAgentForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    departement: 'Informatique',
    role: 'Agent'
  });

  // 🧠 Détection de l'utilisateur connecté
  const agentInfo = JSON.parse(localStorage.getItem('agentInfo'));
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const user = isAdmin
    ? {
        nomComplet: "Dr. Mouhamed Salhi",
        titre: "Administrateur Principal",
        email: "Fst2025@gmail.com",
        telephone: "+216 28345678",
        departement: "Sciences Informatiques",
        status: "Actif"
      }
    : {
        nomComplet: `${agentInfo?.prenom || ''} ${agentInfo?.nom || ''}`,
        titre: agentInfo?.role || 'Agent',
        email: agentInfo?.email || '',
        telephone: agentInfo?.telephone || 'N/A',
        departement: agentInfo?.departement || '',
        status: "Actif"
      };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
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

      {/* ✅ Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* ✅ Profil utilisateur */}
        <Paper
          elevation={0}
          sx={{
            m: 3,
            p: 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            textAlign: 'center'
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              border: `3px solid ${theme.palette.primary.main}`,
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontSize: 40,
              mx: 'auto'
            }}
          >
            <AdminIcon fontSize="inherit" />
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {user.nomComplet}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {user.titre}
            </Typography>
            <Chip
              icon={<VerifiedIcon />}
              label={user.status}
              color="success"
              size="small"
              sx={{ height: 20 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email
                </Typography>
                <Typography variant="body2">{user.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DepartmentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Département
                </Typography>
                <Typography variant="body2">{user.departement}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Téléphone
                </Typography>
                <Typography variant="body2">{user.telephone}</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Divider />

        {/* 🎯 Bouton ajout agent (admin uniquement) */}
        {isAdmin && (
          <Box sx={{ p: 3, pt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddAgentIcon />}
              onClick={() => setOpenAgentDialog(true)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                letterSpacing: 0.5
              }}
            >
              Nouvel Agent
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        <List sx={{ flex: 1 }} />

        {/* 🔴 Déconnexion */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2 }}
          >
            Déconnexion
          </Button>
        </Box>
      </Drawer>

      {/* ✅ Zone centrale */}
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
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Tableau de bord {user.titre}
            </Typography>
            <IconButton onClick={handleMenuOpen}>
              <ProfileIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* 🔄 Menu rapide utilisateur */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { navigate('/admin/profile'); handleMenuClose(); }}>
            <ProfileIcon fontSize="small" sx={{ mr: 1 }} /> Mon Profil
          </MenuItem>
          <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> Paramètres
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Déconnexion
          </MenuItem>
        </Menu>

        {/* 🔽 Contenu dynamique */}
        <Box sx={{ p: 3, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>

      {/* ✳️ Dialog Création Agent (admin uniquement) */}
      <Dialog open={openAgentDialog} onClose={() => setOpenAgentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un nouvel agent</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nom" margin="normal"
            value={agentForm.nom}
            onChange={(e) => setAgentForm({ ...agentForm, nom: e.target.value })}
          />
          <TextField fullWidth label="Prénom" margin="normal"
            value={agentForm.prenom}
            onChange={(e) => setAgentForm({ ...agentForm, prenom: e.target.value })}
          />
          <TextField fullWidth label="Email" type="email" margin="normal"
            value={agentForm.email}
            onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
          />
          <TextField fullWidth label="Mot de passe" type="password" margin="normal"
            value={agentForm.password}
            onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
          />
          <TextField fullWidth select label="Département" margin="normal"
            value={agentForm.departement}
            onChange={(e) => setAgentForm({ ...agentForm, departement: e.target.value })}
          >
            <MenuItem value="Informatique">Informatique</MenuItem>
            <MenuItem value="Mathématiques">Mathématiques</MenuItem>
            <MenuItem value="Physique">Physique</MenuItem>
            <MenuItem value="Administration">Administration</MenuItem>
          </TextField>
          <TextField fullWidth select label="Rôle" margin="normal"
            value={agentForm.role}
            onChange={(e) => setAgentForm({ ...agentForm, role: e.target.value })}
          >
            <MenuItem value="Agent">Agent</MenuItem>
            <MenuItem value="Superviseur">Superviseur</MenuItem>
            <MenuItem value="Administrateur">Administrateur</MenuItem>
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
