import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent, 
  CardActions, Button, Chip, CircularProgress, Avatar, 
  IconButton, useTheme, List, ListItem, ListItemAvatar, 
  ListItemText, Divider, Badge
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Event as EventIcon, 
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  ArrowBack,
  NewReleases,
  FilterList,
  ViewList,
  Apps
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

const GestionDocument = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const API_URL = 'http://localhost:5000/api';

  // Fonction de normalisation des données API
  const normalizeApiData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data?.data)) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  // Fonction pour récupérer la date de diffusion
  const getPublicationDate = (doc) => {
    if (doc.published_at) return new Date(doc.published_at);
    if (doc.createdAt) return new Date(doc.createdAt);
    if (doc.date) return new Date(doc.date);
    return new Date();
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const [emploisRes, examsRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/emplois`),
          axios.get(`${API_URL}/examens`),
          axios.get(`${API_URL}/evenements`)
        ]);

        // Normalisation des données
        const normalizedEmplois = normalizeApiData(emploisRes).map(d => ({ 
          ...d, 
          type: 'emploi',
          docType: 'Emploi du temps'
        }));

        const normalizedExams = normalizeApiData(examsRes).map(d => ({ 
          ...d, 
          type: 'examen',
          docType: 'Examen'
        }));

        const normalizedEvents = normalizeApiData(eventsRes).map(d => ({ 
          ...d, 
          type: 'evenement',
          docType: 'Événement'
        }));

        // Combiner et trier
        const allDocuments = [
          ...normalizedEmplois,
          ...normalizedExams,
          ...normalizedEvents
        ].map(doc => ({
          ...doc,
          publicationDate: getPublicationDate(doc)
        }))
        .sort((a, b) => b.publicationDate - a.publicationDate);

        setDocuments(allDocuments);
      } catch (error) {
        console.error("Erreur chargement documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filtrer les documents
  const filteredDocuments = tabValue === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === tabValue);

  const formatDate = (date) => {
    if (!date) return null;
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      
      if (isToday(dateObj)) {
        return `Aujourd'hui à ${format(dateObj, 'HH:mm', { locale: fr })}`;
      } else if (isTomorrow(dateObj)) {
        return `Demain à ${format(dateObj, 'HH:mm', { locale: fr })}`;
      }
      
      return format(dateObj, "dd MMM yyyy 'à' HH:mm", { locale: fr });
    } catch (e) {
      return date.toString();
    }
  };

  const isNewDocument = (pubDate) => {
    if (!pubDate) return false;
    try {
      const publicationDate = typeof pubDate === 'string' ? new Date(pubDate) : pubDate;
      const now = new Date();
      const diffHours = Math.abs(now - publicationDate) / 36e5;
      return diffHours < 24;
    } catch (e) {
      return false;
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'emploi': return <ScheduleIcon />;
      case 'examen': return <AssignmentIcon />;
      case 'evenement': return <EventIcon />;
      default: return <EventIcon />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'emploi': return theme.palette.primary.main;
      case 'examen': return theme.palette.secondary.main;
      case 'evenement': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'emploi': return theme.palette.primary.light;
      case 'examen': return theme.palette.secondary.light;
      case 'evenement': return theme.palette.success.light;
      default: return theme.palette.grey[200];
    }
  };

  const handleDownload = (id, type) => {
    if (type === 'emploi') {
      window.open(`${API_URL}/emplois/${id}/download`, "_blank");
    }
  };

  // Fonction pour obtenir le titre du document
  const getDocumentTitle = (doc) => {
    switch(doc.type) {
      case 'emploi':
        return doc.type_emploi === 'etudiant' 
          ? `Emploi - ${doc.filiere_nom || ''} ${doc.classe_nom || ''} `
          : `Emploi - ${doc.enseignant_nom || ''}`;
      case 'examen':
        return `${doc.matiere_nom} - ${doc.type}`;
      case 'evenement':
        return doc.titre;
      default:
        return 'Document sans titre';
    }
  };

  // Affichage en mode grille
  const renderGridItem = (doc) => (
    <Grid item xs={12} sm={6} md={4} key={`${doc.type}-${doc.id}`}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.1)'
        }
      }}>
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            justifyContent: 'space-between'
          }}>
            <Chip
              label={doc.docType}
              size="small"
              sx={{ 
                bgcolor: getBgColor(doc.type),
                color: getColor(doc.type),
                fontWeight: 'bold'
              }}
            />
            
            {isNewDocument(doc.publicationDate) && (
              <Chip 
                icon={<NewReleases fontSize="small" />}
                label="Nouveau"
                color="error"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2,
            bgcolor: getBgColor(doc.type),
            borderRadius: '50%',
            width: 56,
            height: 56,
            justifyContent: 'center',
            color: getColor(doc.type)
          }}>
            {getIcon(doc.type)}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {getDocumentTitle(doc)}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: theme.palette.background.default
          }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
              {formatDate(doc.publicationDate)}
            </Typography>
            
            {doc.date && doc.type !== 'emploi' && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                {formatDate(doc.date)}
              </Typography>
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ 
          justifyContent: 'space-between', 
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2
        }}>
          {doc.type === 'emploi' && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(doc.id, doc.type)}
              variant="text"
              size="small"
              sx={{ color: getColor(doc.type) }}
            >
              Télécharger
            </Button>
          )}
          
          <Chip
            label={
              doc.type === 'emploi' 
                ? (doc.type_emploi === 'etudiant' ? 'Étudiants' : 'Enseignant')
                : doc.docType
            }
            size="small"
            variant="outlined"
            sx={{ borderColor: getColor(doc.type), color: getColor(doc.type) }}
          />
        </CardActions>
      </Card>
    </Grid>
  );

  // Affichage en mode liste
  const renderListItem = (doc) => (
    <ListItem 
      key={`${doc.type}-${doc.id}`} 
      sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ 
          bgcolor: getBgColor(doc.type),
          color: getColor(doc.type),
          width: 48, 
          height: 48 
        }}>
          {getIcon(doc.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>
              {getDocumentTitle(doc)}
            </Typography>
            <Chip
              label={doc.docType}
              size="small"
              sx={{ 
                bgcolor: getBgColor(doc.type),
                color: getColor(doc.type),
                fontWeight: 'bold'
              }}
            />
            {isNewDocument(doc.publicationDate) && (
              <Chip 
                label="Nouveau"
                color="error"
                size="small"
                sx={{ ml: 1, fontWeight: 'bold' }}
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Publié le {formatDate(doc.publicationDate)}
            </Typography>
            {doc.date && doc.type !== 'emploi' && (
              <Typography variant="body2" color="text.secondary">
                Date: {formatDate(doc.date)}
              </Typography>
            )}
          </Box>
        }
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {doc.type === 'emploi' && (
          <IconButton 
            onClick={() => handleDownload(doc.id, doc.type)}
            sx={{ color: getColor(doc.type) }}
          >
            <DownloadIcon />
          </IconButton>
        )}
      </Box>
    </ListItem>
  );

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/admin/dashboard')} 
        sx={{ mb: 3, color: theme.palette.text.primary }}
      >
        Retour
      </Button>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Documents diffusés
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Tous vos documents en un seul endroit
          </Typography>
        </Box>
        
        <Box>
          <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
            <ViewList />
          </IconButton>
          <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
            <Apps />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ 
        mb: 4, 
        borderRadius: 2, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        bgcolor: theme.palette.background.paper
      }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48
            },
            '& .Mui-selected': {
              fontWeight: 600,
              color: `${theme.palette.primary.main} !important`
            }
          }}
        >
          <Tab label="Tous les documents" value="all" icon={<FilterList />} iconPosition="start" />
          <Tab label="Emplois du temps" value="emploi" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Examens" value="examen" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="Événements" value="evenement" icon={<EventIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh'
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredDocuments.map(renderGridItem)}
            </Grid>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {filteredDocuments.map(renderListItem)}
            </List>
          )}
        </>
      )}

      {!loading && filteredDocuments.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 10,
          textAlign: 'center',
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          mt: 2
        }}>
          <EventIcon sx={{ 
            fontSize: 80, 
            color: theme.palette.text.disabled, 
            mb: 2 
          }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            Aucun document disponible
          </Typography>
          <Typography color="text.secondary">
            {tabValue === 'all' 
              ? "Aucun document n'a été trouvé dans le système" 
              :` Aucun ${tabValue === 'emploi' ? 'emploi du temps' : tabValue} n'a été trouvé`}
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 3, borderRadius: 2 }}
            onClick={() => setTabValue('all')}
          >
            Voir tous les documents
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GestionDocument;