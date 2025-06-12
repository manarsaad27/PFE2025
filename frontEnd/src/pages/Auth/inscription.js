import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import inscriptionAnim from "../../assets/lotties/inscription.json";
import Lottie from "lottie-react";
import logoFac from "./../../assets/logoFac.png";
import { FaSun, FaMoon } from 'react-icons/fa';

//const API_URL = 'http://localhost:5000/api';
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Inscription = () => {
  const [formData, setFormData] = useState({
    Cin: "",
    Nom_et_prénom: "",
    Téléphone: "",
    email: "",
    password: "",
    confirmPassword: "",
    filière: "",
    classe: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Fonction pour basculer entre les modes sombre et clair
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Vérifier le mode au chargement
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  // Liste des filières avec leurs classes correspondantes
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Styles dynamiques en fonction du mode
  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f0f2f5',
    textColor: darkMode ? '#ffffff' : '#000000',
    navbarBg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#ffffff',
    textSecondary: darkMode ? '#bbbbbb' : '#555555',
    borderColor: darkMode ? '#444444' : '#e0e0e0',
    primaryColor: darkMode ? '#4a8fd2' : '#0056b3',
    secondaryColor: darkMode ? '#f1c40f' : '#f1c40f',
    inputBg: darkMode ? '#3d3d3d' : '#ffffff',
    inputBorder: darkMode ? '#555555' : '#dddddd',
    buttonHover: darkMode ? '#3a7bbd' : '#0069d9',
    errorColor: '#ff6b6b'
  };

  // Charger les filières depuis l'API
  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const response = await fetch(`${API_URL}/api/filieres`);
      
        if (response.ok) {
          const data = await response.json();
          setFilieres(data.data); // S'assurer que c'est un tableau
        }
      } catch (error) {
        console.error("Erreur lors du chargement des filières:", error);
        setFilieres([]); // Définir un tableau vide en cas d'erreur
      }
    };

    fetchFilieres();
  }, []);

  // Charger les classes quand une filière est sélectionnée
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedFiliere) {
        setAvailableClasses([]);
        return;
      }

      setLoadingClasses(true);
      setClassesError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/classes?filiere=${selectedFiliere}`);
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Erreur de chargement des classes");
        }
        
        setAvailableClasses(result.data || []);
        
      } catch (error) {
        console.error("Erreur chargement classes:", error);
        setClassesError(error.message);
        setAvailableClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [selectedFiliere]);

  const handleFiliereChange = async (e) => {
    const filiereId = e.target.value;
    console.log('====================================', filiereId)
    setSelectedFiliere(filiereId);
    setFormData(prev => ({
      ...prev,
      filière: filiereId,
      classe: '' // Réinitialise la sélection de classe
    }));

    // Chargement des classes seulement si une filière est sélectionnée
    if (filiereId) {
      setLoadingClasses(true);
      try {
        const response = await fetch(`${API_URL}/api/classes?filiere=${filiereId}`);
        const result = await response.json();
        
        if (result.success) {
          setClasses(result.data);
        } else {
          setClasses([]);
          console.error('Erreur:', result.message);
        }
      } catch (error) {
        console.error('Erreur de chargement:', error);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    } else {
      setClasses([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si la filière change, réinitialiser la classe
    if (name === "filière") {
      setFormData({
        ...formData,
        [name]: value,
        classe: ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Validation en temps réel pour le mot de passe
    if (name === "password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordFeedback(null);
      return;
    }

    const requirements = {
      minLength: password.length >= 10,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const strength = Object.values(requirements).filter(Boolean).length;

    setPasswordFeedback({
      requirements,
      strength,
      percentage: (strength / 5) * 100,
    });
  };

  const getStrengthColor = (percentage) => {
    if (percentage < 40) return themeStyles.errorColor;
    if (percentage < 70) return "#ffa500";
    return "#00cc00";
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Cin) {
      newErrors.Cin = "Le CIN est requis.";
    } else if (!/^[01]\d{7}$/.test(formData.Cin)) {
      newErrors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
    }
    if (!formData.Nom_et_prénom) newErrors.Nom_et_prénom = "Le nom est requis.";
    if (!formData.Téléphone) newErrors.Téléphone = "Le téléphone est requis.";
    if (!formData.email) newErrors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email est invalide.";
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 10) {
      newErrors.password = "Le mot de passe doit contenir au moins 10 caractères.";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule.";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une minuscule.";
    } else if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre ou caractère spécial.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    if (!formData.filière) newErrors.filière = "La filière est requise.";
    if (!formData.classe) newErrors.classe = "La classe est requise.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  console.log(formData.filière)
    if (validateForm()) {
      try {
        // Préparez les données dans le format attendu par l'API
        const payload = {
          Cin: formData.Cin,
          Nom_et_prénom: formData.Nom_et_prénom,
          Téléphone: formData.Téléphone,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          filiere: formData.filière, // Notez la conversion ici
          classe: formData.classe
        };
  
        console.log("Données envoyées:", payload); // Debug
  
        const response = await fetch(`${API_URL}/etudiant`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify(payload)
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Erreur serveur:", data); // Debug
          if (data.errors) setErrors(data.errors);
          alert(data.message || "Erreur lors de l'inscription");
          return;
        }
  
        // Sauvegarde des données
        localStorage.setItem('studentProfile', JSON.stringify({
          filiere: formData.filière,
          classe: formData.classe
        }));
  
        alert("Inscription réussie !");
        navigate("/connexion");
        
      } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau. Veuillez réessayer.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: themeStyles.backgroundColor,
      padding: "20px",
      transition: 'background-color 0.3s ease'
    },
    table: {
      borderCollapse: "collapse",
      width: "auto",
    },
    formCell: {
      paddingRight: "50px",
      verticalAlign: "middle",
    },
    animationCell: {
      verticalAlign: "middle",
    },
    card: {
      backgroundColor: themeStyles.cardBg,
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "400px",
      transition: 'background-color 0.3s ease'
    },
    title: {
      textAlign: "center",
      marginBottom: "30px",
      color: themeStyles.textColor,
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    formGroup: {
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: `1px solid ${themeStyles.inputBorder}`,
      borderRadius: "5px",
      fontSize: "14px",
      boxSizing: "border-box",
      backgroundColor: themeStyles.inputBg,
      color: themeStyles.textColor,
      transition: 'all 0.3s ease'
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: themeStyles.primaryColor,
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "10px",
      transition: "background-color 0.3s",
      ':hover': {
        backgroundColor: themeStyles.buttonHover
      }
    },
    link: {
      color: themeStyles.primaryColor,
      textDecoration: "none",
      fontWeight: "500",
    },
    error: {
      color: themeStyles.errorColor,
      fontSize: "12px",
      marginTop: "5px",
      display: "block",
    },
    loginLink: {
      marginTop: "20px",
      textAlign: "center",
      fontSize: "14px",
      color: themeStyles.textSecondary,
    },
    lottieContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "500px",
    },
    lottieAnimation: {
      width: "100%",
      height: "100%",
      maxWidth: "450px",
      maxHeight: "450px",
    },
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: themeStyles.backgroundColor,
      color: themeStyles.textColor,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem 5%",
        backgroundColor: themeStyles.navbarBg,
        borderBottom: `1px solid ${themeStyles.borderColor}`,
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <a href="/" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: themeStyles.textColor
        }}>
          <img
            src={logoFac}
            width="80"
            height="80"
            alt="Logo Faculté"
            style={{
              objectFit: "contain",
              marginRight: "1rem",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}
          />
          <div style={{
            borderLeft: `2px solid ${themeStyles.primaryColor}`,
            paddingLeft: "1rem",
            height: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <span style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: themeStyles.primaryColor
            }}>Faculté des Sciences et Techniques FSTSBZ</span>
            <span style={{
              fontSize: "0.9rem",
              color: themeStyles.textSecondary
            }}>Université de Kairouan</span>
          </div>
        </a>

        <div style={{ flexGrow: 1 }}></div>
        
        {/* Bouton de thème */}
        <button 
          onClick={toggleDarkMode}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            marginRight: '20px',
            color: darkMode ? themeStyles.secondaryColor : themeStyles.textSecondary,
            transition: 'all 0.3s ease'
          }}
          title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      {/* Contenu principal */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: themeStyles.backgroundColor,
        padding: "20px",
        paddingTop: "40px",
        transition: 'background-color 0.3s ease'
      }}>
        <div style={styles.container}>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.formCell}>
                  <div style={styles.card}>
                    <h2 style={styles.title}>Inscription Étudiant</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                      <div style={styles.formGroup}>
                        <input
                          type="text"
                          name="Cin"
                          value={formData.Cin}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Numéro CIN (8 chiffres)"
                        />
                        {errors.Cin && <span style={styles.error}>{errors.Cin}</span>}
                      </div>

                      <div style={styles.formGroup}>
                        <input
                          type="text"
                          name="Nom_et_prénom"
                          value={formData.Nom_et_prénom}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Nom et prénom"
                        />
                        {errors.Nom_et_prénom && <span style={styles.error}>{errors.Nom_et_prénom}</span>}
                      </div>

                      <div style={styles.formGroup}>
                        <input
                          type="text"
                          name="Téléphone"
                          value={formData.Téléphone}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Numéro de téléphone"
                        />
                        {errors.Téléphone && <span style={styles.error}>{errors.Téléphone}</span>}
                      </div>

                      <div style={styles.formGroup}>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Adresse email"
                        />
                        {errors.email && <span style={styles.error}>{errors.email}</span>}
                      </div>

                      <div style={styles.formGroup}>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Mot de passe (10 caractères min)"
                        />
                        {errors.password && <span style={styles.error}>{errors.password}</span>}
                        
                        {passwordFeedback && (
                          <div style={{ marginTop: "10px" }}>
                            <div style={{
                              height: "5px",
                              backgroundColor: darkMode ? '#555' : "#e0e0e0",
                              borderRadius: "5px",
                              marginBottom: "5px"
                            }}>
                              <div style={{
                                width:` ${passwordFeedback.percentage}%`,
                                height: "100%",
                                backgroundColor: getStrengthColor(passwordFeedback.percentage),
                                borderRadius: "5px",
                                transition: "all 0.3s ease"
                              }}></div>
                            </div>
                            <small>Force du mot de passe: {passwordFeedback.strength}/5</small>
                            
                            <ul style={{ 
                              margin: "10px 0 0 0", 
                              paddingLeft: "20px", 
                              fontSize: "12px",
                              color: themeStyles.textSecondary
                            }}>
                              <li style={{ color: passwordFeedback.requirements.minLength ? "green" : themeStyles.errorColor }}>
                                Au moins 10 caractères
                              </li>
                              <li style={{ color: passwordFeedback.requirements.hasUpper ? "green" : themeStyles.errorColor }}>
                                Au moins une majuscule
                              </li>
                              <li style={{ color: passwordFeedback.requirements.hasLower ? "green" : themeStyles.errorColor }}>
                                Au moins une minuscule
                              </li>
                              <li style={{ color: passwordFeedback.requirements.hasNumber ? "green" : themeStyles.errorColor }}>
                                Au moins un chiffre
                              </li>
                              <li style={{ color: passwordFeedback.requirements.hasSpecial ? "green" : themeStyles.errorColor }}>
                                Au moins un caractère spécial
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <div style={styles.formGroup}>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Confirmer le mot de passe"
                        />
                        {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
                      </div>

                      {/* Champ Filière */}
                      <div style={styles.formGroup}>
                        <label style={{ color: themeStyles.textColor }}>Filière:</label>
                        <select
                          value={selectedFiliere}
                          onChange={handleFiliereChange}
                          style={styles.input}
                          required
                        >
                          <option value="">Sélectionnez une filière</option>
                          {filieres.map(filiere => (
                            <option key={filiere.id} value={filiere.id}>
                              {filiere.nom}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={{ color: themeStyles.textColor }}>Classe:</label>
                        <select
                          name="classe"
                          value={formData.classe}
                          onChange={handleChange}
                          style={styles.input}
                          disabled={!selectedFiliere || loadingClasses}
                          required
                        >
                          <option value="">
                            {loadingClasses ? 'Chargement...' : 
                              classes.length === 0 ? 'Aucune classe disponible' : 
                              'Sélectionnez une classe'}
                          </option>
                          {classes.map(classe => (
                            <option key={classe.id} value={classe.id}>
                              {classe.nom}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button 
                        type="submit" 
                        style={styles.button} 
                        disabled={isSubmitting}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = themeStyles.buttonHover;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = themeStyles.primaryColor;
                        }}
                      >
                        {isSubmitting ? "En cours..." : "S'inscrire"}
                      </button>
                    </form>

                    <p style={styles.loginLink}>
                      Déjà inscrit? <a href="/connexion" style={styles.link}>Connectez-vous</a>
                    </p>
                  </div>
                </td>
                <td style={styles.animationCell}>
                  <div style={styles.lottieContainer}>
                    <Lottie
                      animationData={inscriptionAnim}
                      loop={true}
                      style={styles.lottieAnimation}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inscription;