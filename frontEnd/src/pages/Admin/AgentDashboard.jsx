import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  AppBar,
  Toolbar,
  Divider,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
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
  Email as EmailIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
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

const AgentSidebar = ({ agent }) => {
  return (
    <Box sx={{ 
      width: 280, 
      bgcolor: 'background.paper', 
      p: 3, 
      minHeight: '100vh',
      boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      {/* Avatar Section */}
      <Box sx={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        bgcolor: deepPurple[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `3px solid ${deepPurple[300]}`,
          boxSizing: 'border-box'
        }
      }}>
        <Typography variant="h3" sx={{ 
          color: deepPurple[600],
          fontWeight: 'bold'
        }}>
          {agent?.prenom?.charAt(0)}{agent?.nom?.charAt(0)}
        </Typography>
      </Box>

      {/* Agent Info */}
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold',
        color: 'text.primary',
        mb: 1
      }}>
        {agent?.prenom} {agent?.nom}
      </Typography>
      
      <Chip 
        label={agent?.role}
        size="small"
        sx={{ 
          bgcolor: teal[100],
          color: teal[800],
          fontWeight: 'medium',
          mb: 3
        }}
      />

      {/* Details Card */}
      <Card sx={{ 
        width: '100%',
        bgcolor: 'background.default',
        borderRadius: '12px',
        p: 2,
        mb: 3,
        textAlign: 'left'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <EmailIcon sx={{ 
            color: deepPurple[400],
            mr: 1.5,
            fontSize: '20px'
          }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {agent?.email}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <BusinessIcon sx={{ 
            color: deepPurple[400],
            mr: 1.5,
            fontSize: '20px'
          }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {agent?.departement}
          </Typography>
        </Box>
      </Card>

      {/* Stats Section */}
      <Box sx={{ 
        width: '100%',
        bgcolor: 'background.default',
        borderRadius: '12px',
        p: 2,
        textAlign: 'center'
      }}>
        <Typography variant="subtitle2" sx={{ 
          color: 'text.secondary',
          mb: 1.5
        }}>
          Activité du mois
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              24
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Actions
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              5
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Tâches
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("Aucun token trouvé dans le localStorage.");
        return;
      }

      try {
        console.log("TOKEN utilisé :", token); // pour debug

        const res = await axios.get("http://localhost:5000/api/agents/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Données de l'agent :", res.data);
        setAgent(res.data.data);
      } catch (error) {
        console.error("Erreur lors du chargement du profil agent :", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, []);

  const features = [
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <AgentSidebar agent={agent} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DashboardIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  Tableau de bord Agent
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon color="action" sx={{ cursor: 'pointer' }} />
                <LogoutIcon color="action" sx={{ cursor: 'pointer' }} />
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Bienvenue {agent?.prenom}
            </Typography>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: `4px solid ${feature.color}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 10px 25px 0 rgba(0,0,0,0.1)'
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
                      <Typography variant="h5" component="h2" align="center" sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
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
                            boxShadow: `0 4px 12px ${feature.color}80`
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

          <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', bgcolor: 'background.paper', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
            <Container maxWidth="xl">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Plateforme Éducative - Tous droits réservés
              </Typography>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AgentDashboard;