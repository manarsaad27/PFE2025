import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  People,
  School,
  Description,
  Event,
  BarChart
} from '@mui/icons-material';
import {  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', utilisateurs: 400, documents: 240 },
  { name: 'Fév', utilisateurs: 300, documents: 139 },
  { name: 'Mar', utilisateurs: 200, documents: 980 },
  { name: 'Avr', utilisateurs: 278, documents: 390 },
  { name: 'Mai', utilisateurs: 189, documents: 480 },
  { name: 'Juin', utilisateurs: 239, documents: 380 },
];

const Statistiques = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Utilisateurs actifs', value: '1,245', icon: <People fontSize="large" />, color: '#1976d2' },
    { title: 'Cours disponibles', value: '42', icon: <School fontSize="large" />, color: '#9c27b0' },
    { title: 'Documents partagés', value: '543', icon: <Description fontSize="large" />, color: '#2e7d32' },
    { title: 'Événements à venir', value: '8', icon: <Event fontSize="large" />, color: '#e91e63' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>
        Statistiques
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ backgroundColor: stat.color, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography variant="h6">{stat.title}</Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </div>
                  <Box sx={{ color: 'white' }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activité mensuelle
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="utilisateurs" fill="#8884d8" />
            <Bar dataKey="documents" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Répartition des utilisateurs
            </Typography>
            {/* Ici vous pourriez ajouter un PieChart */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents par type
            </Typography>
            {/* Ici vous pourriez ajouter un autre graphique */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistiques;