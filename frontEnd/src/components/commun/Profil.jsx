import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { deepPurple } from '@mui/material/colors';

const Profil = () => {
  const agent = JSON.parse(localStorage.getItem('agentInfo'));
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const user = isAdmin
    ? { nom: 'Administrateur', prenom: '', role: 'Administrateur', email: 'admin@domain.com' }
    : agent;

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: deepPurple[500] }}>
          {user?.prenom?.[0] || 'A'}{user?.nom?.[0] || 'D'}
        </Avatar>
        <Typography variant="h5">{user?.prenom} {user?.nom}</Typography>
        <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
        <Typography variant="body2" color="text.secondary">{user?.role}</Typography>
        {!isAdmin && (
          <Typography variant="body2" color="text.secondary">Département : {user?.departement}</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Profil;
