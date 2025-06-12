import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Paper, Grid, Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const Parametres = () => {
  const navigate = useNavigate();

  // État local pour les paramètres
  const [parametres, setParametres] = useState({
    nomEtablissement: 'Université XYZ',
    emailContact: 'contact@univ-xyz.edu',
    telephone: '0123456789',
    adresse: '123 rue des Sciences, Ville',
    siteWeb: 'https://www.univ-xyz.edu',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setParametres({ ...parametres, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Ici, tu pourrais envoyer `parametres` à ton backend ou à une base de données
    setMessage('Paramètres enregistrés avec succès ✅');
    setTimeout(() => setMessage(''), 3000); // Réinitialise le message après 3s
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" gutterBottom>Paramètres Généraux</Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nom de l'établissement"
              name="nomEtablissement"
              fullWidth
              value={parametres.nomEtablissement}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email de contact"
              name="emailContact"
              fullWidth
              value={parametres.emailContact}
              onChange={handleChange}
              type="email"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Téléphone"
              name="telephone"
              fullWidth
              value={parametres.telephone}
              onChange={handleChange}
              type="tel"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Adresse"
              name="adresse"
              fullWidth
              value={parametres.adresse}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Site web"
              name="siteWeb"
              fullWidth
              value={parametres.siteWeb}
              onChange={handleChange}
              type="url"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" onClick={handleSubmit}>
            Enregistrer les modifications
          </Button>
        </Box>

        {message && (
          <Typography sx={{ mt: 2 }} color="success.main">
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Parametres;
