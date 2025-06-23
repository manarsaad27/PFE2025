import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import axios from 'axios';
import logo from '../../assets/logo.png';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Réinitialise l'erreur
    
    try {
      const response = await axios.post(
        'http://localhost:5000/admin/login', // URL corrigée
        credentials,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Box sx={{ position: 'absolute', top: 20, left: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" style={{ height: '50px' }} />
      </Box>

      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Connexion Admin
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />

          <TextField
            label="Mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Se connecter
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin;