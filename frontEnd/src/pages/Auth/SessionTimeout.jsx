import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Typography, Box } from '@mui/material'; // Utilisation de Material-UI

const SessionTimeout = () => {
  const navigate = useNavigate();
  const [openWarning, setOpenWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60); // 1 minute en secondes

  // Paramètres (3 min timeout, 1 min warning)
  const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 minutes en ms
  const WARNING_TIME = 1 * 60 * 1000;    // 1 minute en ms

  useEffect(() => {
    let timeout;
    let warningTimeout;
    let countdownInterval;

    const resetTimers = () => {
      // Réinitialiser tous les timers
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearInterval(countdownInterval);
      
      // Définir le timeout de déconnexion (3 min)
      timeout = setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT);

      // Définir l'avertissement (1 min avant)
      warningTimeout = setTimeout(() => {
        setOpenWarning(true);
        setRemainingTime(60); // Réinitialiser à 60s
        
        // Mettre à jour le compte à rebours
        countdownInterval = setInterval(() => {
          setRemainingTime((prev) => prev - 1);
        }, 1000);
      }, SESSION_TIMEOUT - WARNING_TIME);
    };

    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    const handleExtendSession = async () => {
      try {
        const response = await fetch('/api/extend-session', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
        });
        
        if (response.ok) {
          setOpenWarning(false);
          resetTimers(); // Redémarrer les timers
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    // Écoute les interactions utilisateur
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimers));

    resetTimers(); // Initialisation

    // Nettoyage
    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearInterval(countdownInterval);
      events.forEach((e) => window.removeEventListener(e, resetTimers));
    };
  }, [navigate]);

  return (
    <Modal open={openWarning} onClose={() => setOpenWarning(false)}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          ⏳ Session sur le point d'expirer
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Votre session expire dans {remainingTime} secondes.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExtendSession}
          sx={{ mr: 2 }}
        >
          Rester connecté
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/logout')}
        >
          Se déconnecter
        </Button>
      </Box>
    </Modal>
  );
};

// Style du modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  textAlign: 'center',
};

export default SessionTimeout;