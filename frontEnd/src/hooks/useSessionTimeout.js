import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionTimeout = (timeoutMinutes = 30) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = React.useState(false);
  // Dans useSessionTimeout.js
const logout = () => {
  console.log("Déconnexion automatique déclenchée !");
  localStorage.clear(); 
  navigate('/login');
};

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, timeoutMinutes * 60 * 1000);
    };

    const logout = () => {
      localStorage.clear();
      navigate('/connexion');
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [navigate, timeoutMinutes]);

  return { showWarning };
};