import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, Avatar, Divider,
  IconButton, List, ListItem, ListItemIcon, ListItemText, Drawer, useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DocumentsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  DateRange as DateRangeIcon,
  MenuBook as MenuBookIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { deepPurple } from '@mui/material/colors';

const drawerWidth = 240;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const agentInfo = JSON.parse(localStorage.getItem('agentInfo'));
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const user = isAdmin ? { nom: 'Administrateur', role: 'Administrateur' } : agentInfo;
  const basePath = isAdmin ? '/admin' : '/agent';

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: `${basePath}/dashboard` },
    ...(isAdmin ? [{ text: 'Agents', icon: <PeopleIcon />, path: `${basePath}/agents` }] : []),
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: `${basePath}/utilisateurs` },
    { text: 'Documents', icon: <DocumentsIcon />, path: `${basePath}/documents` },
    { text: 'Cours', icon: <SchoolIcon />, path: `${basePath}/cours` },
    { text: 'Filières', icon: <AccountTreeIcon />, path: `${basePath}/filière` },
    { text: 'Classes', icon: <ClassIcon />, path: `${basePath}/classe` },
    { text: 'Semestres', icon: <DateRangeIcon />, path: `${basePath}/semestre` },
    { text: 'Matières', icon: <MenuBookIcon />, path: `${basePath}/matière` },
    { text: 'Examens', icon: <EventIcon />, path: `${basePath}/examens` },
    { text: 'Emplois', icon: <EventIcon />, path: `${basePath}/schedules` },
    { text: 'Paramètres', icon: <SettingsIcon />, path: `${basePath}/parametres` }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Tableau de bord {user?.role}
          </Typography>
          <IconButton onClick={handleLogout} color="inherit" title="Déconnexion">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar sx={{ mx: 'auto', bgcolor: deepPurple[500] }}>
            {user?.prenom?.[0] || 'A'}{user?.nom?.[0] || 'D'}
          </Avatar>
          <Typography variant="subtitle1">{user?.prenom} {user?.nom}</Typography>
          <Typography variant="caption">{user?.role}</Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item, i) => (
            <ListItem
              button
              key={i}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;