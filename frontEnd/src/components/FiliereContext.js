import { createContext, useContext, useState, useEffect } from 'react';

const FiliereContext = createContext();

export const FiliereProvider = ({ children }) => {
  const [filiere, setFiliere] = useState(() => {
    return localStorage.getItem('selectedFiliere') || '';
  });

  useEffect(() => {
    localStorage.setItem('selectedFiliere', filiere);
  }, [filiere]);

  return (
    <FiliereContext.Provider value={{ filiere, setFiliere }}>
      {children}
    </FiliereContext.Provider>
  );
};

export const useFiliere = () => useContext(FiliereContext);