export const getLocalData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.error("Erreur de lecture du localStorage", e);
      return null;
    }
  };
  
  export const setLocalData = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Erreur d'écriture dans le localStorage", e);
    }
  };
  
  export const clearLocalData = (key) => {
    localStorage.removeItem(key);
  };