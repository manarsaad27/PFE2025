import { createContext, useContext, useState, useEffect } from 'react';

const FiliereContext = createContext();

export const FiliereProvider = ({ children }) => {
  const [filiere, setFiliere] = useState(() => {
    // Récupérer depuis localStorage au chargement
    return localStorage.getItem('selectedFiliere') || '';
  });

  useEffect(() => {
    // Sauvegarder dans localStorage à chaque changement
    localStorage.setItem('selectedFiliere', filiere);
  }, [filiere]);

  return (
    <FiliereContext.Provider value={{ filiere, setFiliere }}>
      {children}
    </FiliereContext.Provider>
  );
};

export const useFiliere = () => useContext(FiliereContext);