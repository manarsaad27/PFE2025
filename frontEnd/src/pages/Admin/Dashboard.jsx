import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Container,
  AppBar,
  Toolbar,
  Avatar,
  useMediaQuery,
  alpha,
  Badge,
  Popover,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import {
  deepPurple,
  teal,
  orange,
  pink,
  blue,
  indigo,
  green
} from '@mui/material/colors';
import {
  People,
  School,
  Description,
  BarChart,
  Settings,
  Event,
  AccountTree,
  Class,
  DateRange,
  MenuBook,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500],
    },
    secondary: {
      main: teal[500],
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 20px',
        },
      },
    },
  },
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const anchorEl = useRef(null);

  const features = [
    {
      title: "Agents Admin",
      description: "Gérez les agents administratifs",
      icon: <People fontSize="large" />,
      path: "/admin/agents",
      color: deepPurple[300]
    },
    {
      title: "Gestion des Utilisateurs",
      description: "Gérez les comptes étudiants, enseignants et administrateurs",
      icon: <People fontSize="large" />,
      path: "/admin/utilisateurs",
      color: deepPurple[500]
    },
    {
      title: "Gestion des Cours",
      description: "Ajoutez et modifiez les cours, TD, TP et ressources",
      icon: <School fontSize="large" />,
      path: "/admin/cours",
      color: indigo[500]
    },
    {
      title: "Documents",
      description: "Gérez tous les documents partagés sur la plateforme",
      icon: <Description fontSize="large" />,
      path: "/admin/documents",
      color: green[500]
    },
    {
      title: "Statistiques",
      description: "Consultez les données d'utilisation de la plateforme",
      icon: <BarChart fontSize="large" />,
      path: "/admin/statistiques",
      color: orange[500]
    },
    {
      title: "Événements",
      description: "Planifiez des conférences et ateliers",
      icon: <Event fontSize="large" />,
      path: "/admin/evenements",
      color: pink[500]
    },
    {
      title: "Filière",
      description: "Ajouter et modifier les filières",
      icon: <AccountTree fontSize="large" />,
      path: "/admin/filière",
      color: teal[500]
    },
    {
      title: "Classe",
      description: "Gérer les classes et groupes d'étudiants",
      icon: <Class fontSize="large" />,
      path: "/admin/classe",
      color: deepPurple[300]
    },
    {
      title: "Semestre",
      description: "Organiser les semestres académiques",
      icon: <DateRange fontSize="large" />,
      path: "/admin/semestre",
      color: blue[300]
    },
    {
      title: "Matière",
      description: "Gérer le catalogue des matières",
      icon: <MenuBook fontSize="large" />,
      path: "/admin/matière",
      color: orange[300]
    },
    {
      title: "Emploi",
      description: "Gérer les emplois nécessaires",
      icon: <Event fontSize="large" />,
      path: "/admin/schedules",
      color: green[300]
    },
    {
      title: "Calendrier",
      description: "Gérer les calendriers des Examens",
      icon: <Event fontSize="large" />,
      path: "/admin/examens",
      color: pink[300]
    }
  ];

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      const { data } = await axios.get("/api/admin/notifications");
      setNotifications(data.data);
      setUnreadCount(data.data.filter((n) => !n.read_status).length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  // Gérer l'ouverture/fermeture du popover
  const handleToggleNotifications = () => {
    setOpen(!open);
    if (hasNewNotification) {
      setHasNewNotification(false);
    }
  };

  const handleCloseNotifications = () => {
    setOpen(false);
  };

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/admin/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? {...n, read_status: true} : n
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  useEffect(() => {
    // Charger les réclamations existantes depuis l'API
    const fetchReclamations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/r/apieclamations");
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      } catch (err) {
        console.error("Erreur chargement réclamations:", err);
      }
    };
    
    fetchReclamations();
    socket.emit("registerAsAdmin");
    socket.on("newReclamation", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setHasNewNotification(true);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off("newReclamation");
    };
  }, []);

  // Charger les notifications au montage et toutes les 30 secondes
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DashboardIcon color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Tableau de bord
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                ref={anchorEl}
                onClick={handleToggleNotifications}
                sx={{ 
                  position: 'relative',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  invisible={unreadCount === 0}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <LogoutIcon color="action" sx={{ cursor: 'pointer' }} />
            </Box>
          </Toolbar>
        </AppBar>

        <Popover
          open={open}
          anchorEl={anchorEl.current}
          onClose={handleCloseNotifications}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: isMobile ? '90vw' : 400,
              maxHeight: '70vh',
              overflow: 'auto',
              p: 2,
              borderRadius: 2,
              boxShadow: theme.shadows[10]
            }
          }}
        >
          <ClickAwayListener onClickAway={handleCloseNotifications}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" color="text.primary">
                  Notifications
                </Typography>
                <IconButton onClick={handleCloseNotifications} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 2 }}>
                  Aucune notification pour le moment
                </Typography>
              ) : (
                <List dense>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id || index}>
                      <ListItem 
                        sx={{ 
                          backgroundColor: notification.read_status ? 'inherit' : alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" color="text.primary">
                              {notification.email || "Système"}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {notification.message || notification.description}
                            </Typography>
                          }
                          secondaryTypographyProps={{
                            sx: {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </ClickAwayListener>
        </Popover>

        <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Tableau de bord administratif
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gestion complète de la plateforme éducative
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    borderLeft: `4px solid ${feature.color}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 10px 25px 0 rgba(0,0,0,0.1)`
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '12px',
                        bgcolor: `${feature.color}20`,
                        color: feature.color,
                        mb: 2,
                        mx: 'auto'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2" 
                      align="center" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center" 
                      sx={{ mb: 2 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: feature.color,
                        '&:hover': {
                          bgcolor: feature.color,
                          boxShadow:` 0 4px 12px ${feature.color}80`
                        }
                      }}
                      onClick={() => navigate(feature.path)}
                    >
                      Accéder
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            px: 2, 
            mt: 'auto', 
            bgcolor: 'background.paper',
            borderTop: '1px solid rgba(0,0,0,0.12)'
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Plateforme Éducative - Tous droits réservés
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;