import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  FaUser, FaCalendarAlt, FaBook, FaClipboardList, 
  FaSignOutAlt, FaBookOpen, FaClock,
   FaGraduationCap, FaBell,
   FaFileDownload
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn, MdEvent } from "react-icons/md";
import { 
  Box, CircularProgress, Button, Typography,
  TableContainer, Paper, Table, TableHead, TableRow, 
  TableCell, TableBody
 
} from '@mui/material';
import logoFac from "./../../assets/logoFac.png";
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import NotificationSystem from '../../components/NotificationSystem';

const theme = {
  primary: "#4a6cf7",
  secondary: "#657ef8",
  light: "#f8fafc",
  dark: "#0f172a",
  accent: "#f97316",
  success: "#10b981",
  background: "#f1f5f9"
};

const EtudiantProfil = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [parsedSchedule, setParsedSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const fileInputRef = useRef();
  const [apercu, setApercu] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const cin = localStorage.getItem('studentCin');
      
      const response = await axios.get(`http://localhost:5000/api/etudiant/${cin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStudentData({
          profile: {
            ...response.data.data,
            email: response.data.data.email,
            filiereNom: response.data.data.Filière,
            classeNom: response.data.data.Classe,
            ProfileImage: response.data.data.ProfileImage || null
          }
        });

        const examsResponse = await axios.get(`http://localhost:5000/api/examens/etudiant/${cin}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (examsResponse.data.success) {
          setExams(examsResponse.data.data);
        }

        if (response.data.data.Classe) {
          const emploiRes = await axios.get(
            `http://localhost:5000/api/emplois/classe/${response.data.data.Classe}?type=etudiant`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (emploiRes.data.success && emploiRes.data.data.length > 0) {
            const emploiData = emploiRes.data.data[0];
            setEmploiDuTemps(emploiData);
            
            const parseRes = await axios.get(
              `http://localhost:5000/api/emplois/${emploiData.id}/parsed`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setParsedSchedule(parseRes.data.data);
          }
        }
      }
      const eventsRes = await axios.get("http://localhost:5000/api/evenements");
      setEvents(eventsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner une image (JPEG/PNG).");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => setApercu(reader.result);
    reader.readAsDataURL(file);
  
    try {
      const formData = new FormData();
      formData.append('profile', file);
  
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/etudiant/upload-profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.data.success) {
        setStudentData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            ProfileImage: response.data.imageUrl
          }
        }));
        alert("Photo mise à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      alert(`Échec : ${error.response?.data?.message || "Erreur réseau"}`);
    }
  };

  // Navigation
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentCin');
    localStorage.removeItem('role');
    localStorage.removeItem('unreadCount');
    navigate('/connexion');
  };

  const navigateToDocuments = () => {
    navigate('/studentDoc');
  };

  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={theme.background}>
        <CircularProgress size={60} style={{ color: theme.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" bgcolor={theme.background}>
        <Typography variant="h6" color="error" gutterBottom>
          Erreur de chargement des données
        </Typography>
        <Typography variant="body1" gutterBottom style={{ color: theme.dark }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          style={{ backgroundColor: theme.primary, color: 'white', marginTop: '1rem' }}
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  const studentProfile = studentData ? {
    name: studentData.profile.Nom_et_prénom || "Nom non spécifié",
    cin: studentData.profile.CIN || "CIN non spécifié",
    email: studentData.profile.Email || "Email non spécifié",
    phone: studentData.profile.Téléphone || "Non spécifié",
    filiere: studentData.profile.filiereNom || "Filière non spécifiée",
    classe: studentData.profile.classeNom || "Classe non spécifiée"
  } : null;

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: theme.background,
      minHeight: "100vh",
      color: theme.dark
    }}>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1rem 5%",
          backgroundColor: "#fff",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src={logoFac}
            width="60"
            height="60"
            alt="Logo Faculté"
            style={{ objectFit: "contain", marginRight: "1rem" }}
          />
          <div>
            <Typography variant="h6" style={{ color: theme.primary, fontWeight: "bold" }}>
              Faculté des Sciences et Techniques
            </Typography>
            <Typography variant="subtitle2" style={{ color: "#64748b" }}>
              Université de Kairouan
            </Typography>
          </div>
        </a>
        <div style={{ flexGrow: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <NotificationSystem audience="etudiants" />

          <Button
            variant="contained"
            style={{ 
              backgroundColor: theme.primary, 
              color: 'white',
              fontWeight: "600",
              borderRadius: '12px',
              padding: '8px 20px',
              textTransform: 'none'
            }}
            onClick={navigateToDocuments}
            startIcon={<FaBookOpen />}
          >
            Documents
          </Button>

          <Button
            variant="contained"
            style={{ 
              backgroundColor: theme.accent, 
              color: 'white',
              fontWeight: "600",
              borderRadius: '12px',
              padding: '8px 20px',
              textTransform: 'none'
            }}
            onClick={handleLogout}
            startIcon={<FaSignOutAlt />}
          >
            Déconnexion
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div style={{ 
        padding: "2rem 5%", 
        minHeight: "calc(100vh - 80px)",
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem',
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "#e0e0e0",
              overflow: "hidden",
              cursor: 'pointer',
              border: `3px solid ${theme.primary}`,
              flexShrink: 0
            }}
            onClick={() => fileInputRef.current.click()}
          >
            {apercu ? (
              <img
                src={apercu}
                alt="Photo de profil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : studentData?.profile?.ProfileImage ? (
              <img
                src={`http://localhost:5000${studentData.profile.ProfileImage}`}
                alt="Photo de profil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <FaUser size={50} color={theme.primary} style={{ marginTop: '35px', marginLeft: '35px' }} />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
            accept="image/*"
          />

          <div style={{ flex: 1 }}>
            <Typography variant="h4" style={{ 
              color: theme.dark, 
              fontWeight: '700', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {studentProfile.name} 
              <span style={{
                fontSize: '1rem',
                fontWeight: '500',
                backgroundColor: 'rgba(74, 108, 247, 0.1)',
                color: theme.primary,
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                Étudiant
              </span>
            </Typography>
            <Typography variant="subtitle1" style={{ 
              color: '#64748b', 
              fontWeight: '500',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaGraduationCap style={{ color: theme.primary }} />
              {studentProfile.filiere} • {studentProfile.classe}
            </Typography>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(74, 108, 247, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MdEmail color={theme.primary} size={18} />
                </div>
                <Typography style={{ color: theme.dark, fontWeight: '500' }}>
                  {studentProfile.email}
                </Typography>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(74, 108, 247, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MdPhone color={theme.primary} size={18} />
                </div>
                <Typography style={{ color: theme.dark, fontWeight: '500' }}>
                  {studentProfile.phone}
                </Typography>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Emploi du temps */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "1.5rem",
              gridColumn: 'span 2',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Typography variant="h5" style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                color: theme.dark,
                fontWeight: '600'
              }}>
                <FaClock /> Emploi du temps
              </Typography>
              
              {emploiDuTemps && (
                <Button
                  variant="contained"
                  style={{ 
                    backgroundColor: theme.primary, 
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '500',
                    padding: '6px 16px'
                  }}
                  startIcon={<FaFileDownload />}
                  href={`http://localhost:5000${emploiDuTemps.fichier_path}`}
                  target="_blank"
                >
                  Télécharger
                </Button>
              )}
            </div>

            {emploiDuTemps && parsedSchedule ? (
              <div>
                <TableContainer component={Paper} sx={{
                  margin: '1rem 0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {parsedSchedule.headers.map((header, idx) => (
                          <TableCell
                            key={idx}
                            align="center"
                            sx={{
                              backgroundColor: theme.primary,
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {parsedSchedule.rows.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          sx={{
                            '&:nth-of-type(even)': {
                              backgroundColor: '#f8fafc'
                            }
                          }}
                        >
                          {parsedSchedule.headers.map((header, colIndex) => (
                            <TableCell
                              key={`${rowIndex}-${colIndex}`}
                              align="center"
                              sx={{
                                padding: '10px',
                                borderBottom: '1px solid #f1f5f9',
                                fontSize: '0.9rem',
                                fontWeight: header === "Jour" ? '600' : '500',
                                color: header === "Jour" ? theme.primary : theme.dark
                              }}
                            >
                              {row[header] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="body2" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#64748b',
                  marginTop: '1rem'
                }}>
                  <FaCalendarAlt />
                  Dernière mise à jour: {new Date(emploiDuTemps.published_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </div>
            ) : (
              <Box sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                marginTop: '1rem'
              }}>
                <Typography variant="body1" color="textSecondary">
                  Aucun emploi du temps disponible
                </Typography>
              </Box>
            )}
          </motion.div>

          {/* Examens à venir */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography variant="h5" style={{ 
              marginBottom: "1.5rem", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              color: theme.dark,
              fontWeight: '600'
            }}>
              <FaClipboardList /> Examens à venir
            </Typography>

            {exams.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Typography variant="body1" color="textSecondary">
                  Aucun examen à venir
                </Typography>
              </Box>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {exams.map((exam, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    style={{
                      padding: "1.2rem",
                      marginBottom: "1rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px"
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Typography variant="subtitle1" style={{ 
                          color: theme.dark, 
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}>
                          {exam.matiere_nom}
                        </Typography>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <FaCalendarAlt color="#64748b" size={14} />
                          <Typography variant="body2" style={{ color: '#64748b' }}>
                            {new Date(exam.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                            {" • " + exam.heure_debut} - {exam.heure_fin}
                          </Typography>
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: exam.type === 'Examen' ? theme.primary : theme.success,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {exam.type}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginTop: '0.8rem'
                    }}>
                      <FaBook color="#64748b" size={14} />
                      <Typography variant="body2" style={{ color: '#64748b' }}>
                        {exam.salle} • {exam.filiere_nom}
                      </Typography>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Événements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Typography variant="h5" style={{ 
              marginBottom: "1.5rem", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              color: theme.dark,
              fontWeight: '600'
            }}>
              <MdEvent /> Événements à venir
            </Typography>
            
            {events.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Typography variant="body1" color="textSecondary">
                  Aucun événement à venir
                </Typography>
              </Box>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => handleEventClick(event.titre)} 
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ event, onClick, theme }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1rem',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ 
            fontSize: '1.1rem',
            fontWeight: '600',
            color: theme.dark,
            margin: 0
          }}>
            {event.titre}
          </h3>
          <div style={{
            backgroundColor: theme.primary,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {event.type}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            flex: 1
          }}>
            <FaCalendarAlt color="#64748b" size={16} />
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {formattedDate} à {formattedTime}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            flex: 1
          }}>
            <MdLocationOn color="#64748b" size={16} />
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {event.lieu}
            </span>
          </div>
        </div>
        
        <p style={{ 
          color: '#64748b',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          marginTop: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </p>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ scale: 1.03 }}
    style={{
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '1.2rem',
      textAlign: 'center'
    }}
  >
    <div style={{ 
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      backgroundColor: `${color}10`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      color: color
    }}>
      {icon}
    </div>
    <Typography variant="h4" style={{ 
      color: color, 
      fontWeight: '700', 
      margin: '0.8rem 0',
      fontSize: '1.8rem'
    }}>
      {value}
    </Typography>
    <Typography variant="body2" style={{ color: '#64748b' }}>
      {title}
    </Typography>
  </motion.div>
);

export default EtudiantProfil;
