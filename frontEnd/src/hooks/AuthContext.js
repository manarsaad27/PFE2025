// hooks/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: null,
    role: null,
    isAuthenticated: false
  });

  useEffect(() => {
    // Initialiser l'état au chargement
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
      setAuthState({
        token,
        role,
        isAuthenticated: true
      });
    }
  }, []);

  const login = (token, role, additionalData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    
    // Stocker les données supplémentaires selon le rôle
    if (role === 'enseignant') {
      localStorage.setItem('teacherCin', additionalData.cin);
      localStorage.setItem('teacherEmail', additionalData.email);
    } else if (role === 'etudiant') {
      localStorage.setItem('studentCin', additionalData.cin);
    }

    setAuthState({
      token,
      role,
      isAuthenticated: true
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({
      token: null,
      role: null,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);