import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Typography, Box } from '@mui/material';

const SessionTimeout = () => {
  const navigate = useNavigate();
  const [openWarning, setOpenWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);

  const SESSION_TIMEOUT = 3 * 60 * 1000; 
  const WARNING_TIME = 1 * 60 * 1000;

  let timeout;
  let warningTimeout;
  let countdownInterval;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connexion');
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
        resetTimers(); 
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const resetTimers = () => {
    clearTimeout(timeout);
    clearTimeout(warningTimeout);
    clearInterval(countdownInterval);

    timeout = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);

    warningTimeout = setTimeout(() => {
      setOpenWarning(true);
      setRemainingTime(60);

      countdownInterval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimers));

    resetTimers();

    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearInterval(countdownInterval);
      events.forEach((e) => window.removeEventListener(e, resetTimers));
    };
  }, []);

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
