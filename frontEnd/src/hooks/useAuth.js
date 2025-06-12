// hooks/useAuth.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (requiredRole) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userRole) {
      navigate('/connexion');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      navigate('/nonAutorisé');
    }
  }, [navigate, requiredRole]);

  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('userRole'),
    cin: localStorage.getItem('studentCin') || localStorage.getItem('teacherCin')
  };
};