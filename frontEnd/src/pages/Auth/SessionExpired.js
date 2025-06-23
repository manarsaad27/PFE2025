import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Container, Box } from '@mui/material';

const SessionExpired = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Session expirée
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Votre session a expiré en raison d'une inactivité prolongée.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Veuillez vous reconnecter pour continuer.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/connexion"
          sx={{ mt: 2 }}
        >
          Se reconnecter
        </Button>
      </Box>
    </Container>
  );
};

export default SessionExpired;