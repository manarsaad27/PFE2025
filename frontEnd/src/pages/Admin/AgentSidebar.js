import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Divider } from '@mui/material';

const AgentSidebar = () => {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/agents/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAgent(res.data.data);
      } catch (error) {
        console.error('Erreur lors du chargement des infos agent:', error);
      }
    };

    fetchAgent();
  }, []);

  if (!agent) return null;

  return (
    <Box sx={{ width: 300, bgcolor: 'white', p: 3, borderRight: '1px solid #ddd' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Profil de l'agent</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography><strong>Nom:</strong> {agent.nom} {agent.prenom}</Typography>
      <Typography><strong>Email:</strong> {agent.email}</Typography>
      <Typography><strong>Département:</strong> {agent.departement}</Typography>
      <Typography><strong>Rôle:</strong> {agent.role}</Typography>
    </Box>
  );
};

export default AgentSidebar;
