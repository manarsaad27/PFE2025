import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, Avatar,
  Divider, IconButton, Button, Paper, Chip, Menu, MenuItem, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';

import {
  Person as ProfileIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Verified as VerifiedIcon,
  Business as DepartmentIcon,
  Phone as PhoneIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  InsertChart as StatsIcon,
  EventNote as EventIcon,
  School as FiliereIcon,
  Class as ClasseIcon,
  MenuBook as MatiereIcon,
  Layers as SemestreIcon,
  CalendarMonth as ScheduleIcon,
  Assignment as ExamIcon
} from '@mui/icons-material';

import { useTheme, alpha } from '@mui/material/styles';

const drawerWidth = 300;

const AgentLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios
        .get('http://localhost:5000/api/agents/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((res) => {
          console.log("✅ Données agent:", res.data);
          setAgent(res.data.data);
        })
        .catch((err) => {
          console.error("❌ Erreur récupération agent:", err);
        });
    }
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/agent/login');
  };

  if (!agent) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Chargement du profil agent...</Typography>
      </Box>
    );
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, to: '/agent/dashboard' },
    { text: 'Utilisateurs', icon: <PeopleIcon />, to: '/agent/utilisateurs' },
    { text: 'Documents', icon: <FolderIcon />, to: '/agent/documents' },
    { text: 'Statistiques', icon: <StatsIcon />, to: '/agent/statistiques' },
    { text: 'Événements', icon: <EventIcon />, to: '/agent/evenements' },
    { text: 'Filières', icon: <FiliereIcon />, to: '/agent/filière' },
    { text: 'Classes', icon: <ClasseIcon />, to: '/agent/classe' },
    { text: 'Matières', icon: <MatiereIcon />, to: '/agent/matière' },
    { text: 'Semestres', icon: <SemestreIcon />, to: '/agent/semestre' },
    { text: 'Emplois du temps', icon: <ScheduleIcon />, to: '/agent/schedules' },
    { text: 'Examens', icon: <ExamIcon />, to: '/agent/examens' }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* === Sidebar === */}
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
            p: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            textAlign: 'center'
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mb: 1,
              border: `2px solid ${theme.palette.primary.main}`,
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontSize: 30,
              mx: 'auto'
            }}
          >
            {agent.prenom?.[0]}
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {agent.prenom} {agent.nom}
          </Typography>

          <Chip
            icon={<VerifiedIcon />}
            label="Actif"
            color="success"
            size="small"
            sx={{ my: 1 }}
          />

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" color="text.secondary">
            {agent.role} - {agent.departement}
          </Typography>
        </Paper>

        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.to}>
                {item.icon}
                <ListItemText primary={item.text} sx={{ ml: 2 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

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

      {/* === Contenu central === */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Déconnexion
          </MenuItem>
        </Menu>

        <Box sx={{ p: 3, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AgentLayout;