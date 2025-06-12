import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, Avatar,
  Divider, IconButton, Button, Paper, Chip, Menu, MenuItem
} from '@mui/material';

import {
  Person as ProfileIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Verified as VerifiedIcon,
  Business as DepartmentIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

import { useTheme, alpha } from '@mui/material/styles';

const drawerWidth = 320;

const AgentLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [agent, setAgent] = useState(null);

  const email = localStorage.getItem('agentEmail');

  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:3000/api/agent-profile?email=${email}`)
        .then(res => {
          console.log('✅ Données agent :', res.data);
          setAgent(res.data);
        })
        .catch(err => console.error('❌ Erreur récupération agent :', err));
    }
  }, [email]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!agent) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Chargement du profil agent...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* === Sidebar gauche === */}
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
            {agent.prenom?.[0]}
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {agent.prenom} {agent.nom}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {agent.role}
            </Typography>
            <Chip
              icon={<VerifiedIcon />}
              label="Actif"
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
                <Typography variant="body2">{agent.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DepartmentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Département
                </Typography>
                <Typography variant="body2">{agent.departement}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Téléphone
                </Typography>
                <Typography variant="body2">{agent.telephone || 'Non fourni'}</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ p: 2, mt: 'auto' }}>
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

      {/* === Zone centrale === */}
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
              Tableau de bord Agent
            </Typography>
            <IconButton onClick={handleMenuOpen}>
              <ProfileIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Déconnexion
          </MenuItem>
        </Menu>

        {/* === Contenu injecté via Outlet === */}
        <Box sx={{ p: 3, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AgentLayout;
