import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress
} from '@mui/material';
import { 
  People, 
  School, 
  Description, 
  Event, 
  Assignment, 
  Book, 
  Report 
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

const DashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, formationsRes, documentsRes, emploisRes, examensRes, evenementsRes, reclamationsRes] = 
          await Promise.all([
            axios.get('/api/stats/users'),
            axios.get('/api/stats/formations'),
            axios.get('/api/stats/documents'),
            axios.get('/api/stats/emplois'),
            axios.get('/api/stats/examens'),
            axios.get('/api/stats/evenements'),
            axios.get('/api/stats/reclamations')
          ]);

        setStats({
          users: usersRes.data,
          formations: formationsRes.data,
          documents: documentsRes.data,
          emplois: emploisRes.data,
          examens: examensRes.data,
          evenements: evenementsRes.data,
          reclamations: reclamationsRes.data
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Tableau de Bord Statistique
      </Typography>

      {/* Cartes de résumé */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Utilisateurs</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.users.total}</Typography>
              <Typography color="text.secondary">
                {stats.users.etudiants} étudiants, {stats.users.enseignants} enseignants, {stats.users.agents} agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <School color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Formations</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.formations.filieres}</Typography>
              <Typography color="text.secondary">
                {stats.formations.classes} classes, {stats.formations.matieres} matières
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Description color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Documents</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.documents.total}</Typography>
              <Typography color="text.secondary">
                {/*{stats.documents.types.map(t => `${t.value} ${t.name}`).join(', ')}*/}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Report color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Réclamations</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.reclamations.total}</Typography>
              <Typography color="text.secondary">
                {stats.reclamations.status[0].value} non traitées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques et tableaux */}
      <Grid container spacing={3}>
        {/* Répartition des utilisateurs */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Répartition des Utilisateurs
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Étudiants', value: stats.users.etudiants },
                    { name: 'Enseignants', value: stats.users.enseignants },
                    { name: 'Agents', value: stats.users.agents }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[stats.users.etudiants, stats.users.enseignants, stats.users.agents].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Types d'examens */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Types d'Examens
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.examens.types}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Nombre" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Statut des réclamations */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Statut des Réclamations
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.reclamations.status}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.reclamations.status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Détails des formations */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Détails des Formations
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Filière</TableCell>
                    <TableCell align="right">Classes</TableCell>
                    <TableCell align="right">Matières</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.formations.details.map((filiere) => (
                    <TableRow key={filiere.id}>
                      <TableCell>{filiere.nom}</TableCell>
                      <TableCell align="right">{filiere.classes}</TableCell>
                      <TableCell align="right">{filiere.matieres}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Prochains événements */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Prochains Événements
            </Typography>
            <Grid container spacing={2}>
              {stats.evenements.prochains.map((event) => (
                <Grid item xs={12} sm={6} md={3} key={event.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary">{event.titre}</Typography>
                      <Typography variant="h6">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="body2">{event.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats;