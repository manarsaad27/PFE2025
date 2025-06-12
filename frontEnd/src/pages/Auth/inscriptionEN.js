import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import inscriptionEnAnim from "../../assets/lotties/inscription.json";
import Lottie from "lottie-react";
import logoFac from "./../../assets/logoFac.png";
const InscriptionEn = () => {
  const [formData, setFormData] = useState({
    Cin: "",
    Nom_et_prénom: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    Numero_tel: "",
    Classement: "",
    Description: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "Password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 10,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordFeedback({
      requirements,
      strength: Object.values(requirements).filter(Boolean).length,
      percentage: (Object.values(requirements).filter(Boolean).length / 5) * 100
    });
  };

  const getStrengthColor = (percentage) => {
    if (percentage < 40) return "#ff0000";
    if (percentage < 70) return "#ffa500";
    return "#00cc00";
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.Cin) {
      newErrors.Cin = "Le CIN est requis.";
    } else if (!/^[01]\d{7}$/.test(formData.Cin)) {
      newErrors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
    }
    
    if (!formData.Nom_et_prénom?.trim()) {
      newErrors.Nom_et_prénom = "Le nom est requis.";
    }
    
    if (!formData.Email?.trim()) {
      newErrors.Email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "L'email est invalide.";
    }
    
    if (!formData.Password) {
      newErrors.Password = "Le mot de passe est requis.";
    } else if (passwordFeedback?.strength < 3) {
      newErrors.Password = "Le mot de passe est trop faible.";
    }
    
    if (formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = "Les mots de passe ne correspondent pas.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.Numero_tel) {
      newErrors.Numero_tel = "Le numéro de téléphone est requis.";
    } else if (!/^\d{8}$/.test(formData.Numero_tel)) {
      newErrors.Numero_tel = "Le numéro doit contenir exactement 8 chiffres.";
    }
    
    if (!formData.Classement?.trim()) {
      newErrors.Classement = "Le classement est requis.";
    }
    
    if (!formData.Description?.trim()) {
      newErrors.Description = "La description est requise.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep2()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch("http://localhost:5000/enseignants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors de l'inscription");
        }

        navigate("/teacherProfil", { state: { success: true } });
      } catch (error) {
        console.error("Erreur:", error);
        alert(error.message || "Une erreur est survenue");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem 5%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <a href="/" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
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
            borderLeft: "2px solid #0056b3",
            paddingLeft: "1rem",
            height: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <span style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#0056b3"
            }}>Faculté des Sciences et Techniques FSTSBZ</span>
            <span style={{
              fontSize: "0.9rem",
              color: "#555"
            }}>Université de Kairouan</span>
          </div>
        </a>

      </header>

      {/* Contenu existant */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        padding: "20px",
        paddingTop: "40px"
      }}></div>

    <div style={styles.container}>
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.formCell}>
              <div style={styles.card}>
                <h2 style={styles.title}>Inscription Enseignant - Étape {currentStep}/2</h2>
                
                {currentStep === 1 ? (
                  <div style={styles.form}>
                    <div style={styles.formGroup}>
                      <input
                        type="text"
                        name="Cin"
                        value={formData.Cin}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Numéro CIN"
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
                      {errors.Nom_et_prénom && (
                        <span style={styles.error}>{errors.Nom_et_prénom}</span>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Adresse email "
                      />
                      {errors.Email && <span style={styles.error}>{errors.Email}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <input
                        type="password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Mot de passe (10 caractères min)"
                      />
                      {errors.Password && <span style={styles.error}>{errors.Password}</span>}
                      
                      {passwordFeedback && (
                        <div style={{ marginTop: "10px" }}>
                          <div style={{
                            height: "5px",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "5px",
                            marginBottom: "5px"
                          }}>
                            <div style={{
                              width: `${passwordFeedback.percentage}%`,
                              height: "100%",
                              backgroundColor: getStrengthColor(passwordFeedback.percentage),
                              borderRadius: "5px",
                              transition: "all 0.3s ease"
                            }}></div>
                          </div>
                          <small>Force du mot de passe: {passwordFeedback.strength}/5</small>
                          
                          <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", fontSize: "12px" }}>
                            <li style={{ color: passwordFeedback.requirements.minLength ? "green" : "red" }}>
                              Au moins 10 caractères
                            </li>
                            <li style={{ color: passwordFeedback.requirements.hasUpper ? "green" : "red" }}>
                              Au moins une majuscule
                            </li>
                            <li style={{ color: passwordFeedback.requirements.hasLower ? "green" : "red" }}>
                              Au moins une minuscule
                            </li>
                            <li style={{ color: passwordFeedback.requirements.hasNumber ? "green" : "red" }}>
                              Au moins un chiffre
                            </li>
                            <li style={{ color: passwordFeedback.requirements.hasSpecial ? "green" : "red" }}>
                              Au moins un caractère spécial
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <input
                        type="password"
                        name="ConfirmPassword"
                        value={formData.ConfirmPassword}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Confirmer le mot de passe"
                      />
                      {errors.ConfirmPassword && (
                        <span style={styles.error}>{errors.ConfirmPassword}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      style={styles.button}
                    >
                      Suivant
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                      <input
                        type="text"
                        name="Numero_tel"
                        value={formData.Numero_tel}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Numéro de téléphone"
                      />
                      {errors.Numero_tel && <span style={styles.error}>{errors.Numero_tel}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <input
                        type="text"
                        name="Classement"
                        value={formData.Classement}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Classement"
                      />
                      {errors.Classement && (
                        <span style={styles.error}>{errors.Classement}</span>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        style={{...styles.input, minHeight: "100px"}}
                        placeholder="Description"
                      />
                      {errors.Description && <span style={styles.error}>{errors.Description}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleBack}
                        style={{ ...styles.button, backgroundColor: '#6c757d' }}
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        style={styles.button}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Enregistrement...' : 'S\'inscrire'}
                      </button>
                    </div>
                  </form>
                )}

                <p style={styles.loginLink}>
                  Déjà inscrit?{" "}
                  <a href="/connexion" style={styles.link}>
                    Connectez-vous
                  </a>
                </p>
              </div>
            </td>
            <td style={styles.animationCell}>
              <div style={styles.lottieContainer}>
                <Lottie
                  animationData={inscriptionEnAnim}
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
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
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
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
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
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.3s",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
    display: "block",
  },
  loginLink: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
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

export default InscriptionEn;