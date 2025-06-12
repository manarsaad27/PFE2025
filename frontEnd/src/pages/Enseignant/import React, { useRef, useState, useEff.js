import React, { useRef, useState, useEffect , useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from 'antd';
import logoFac from "./../../assets/logoFac.png";
import Lottie from "lottie-react";
import home from "../../assets/lotties/home.json";
import axios from 'axios';
import { useAuth } from "./../../hooks/useAuth";
import { 
  FaChalkboardTeacher, 
  FaClock, 
  FaBook, 
  FaTicketAlt,
  FaUniversity , 
  FaCalendarAlt ,
  FaSyncAlt
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { Download as DownloadIcon } from '@mui/icons-material';
import { 
  Typography, 
  Button,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Box
} from '@mui/material';
import { motion } from 'framer-motion';

const TeacherProfil = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [teacherExams, setTeacherExams] = useState([]);
  const fileInputRef = useRef(null);
const [emploiDuTemps, setEmploiDuTemps] = useState(null);
const [parsedSchedule, setParsedSchedule] = useState(null);
const [error, setError] = useState(null);
const { token, role, cin } = useAuth('enseignant');
  const [success, setSuccess] = useState(null);
const [loadingEmploi, setLoadingEmploi] = useState(true);
  const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api' 
    : '/api';

  // Styles réutilisables
  const styles = {
    container: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    },
    header: {
      display: "flex",
      alignItems: "center",
      padding: "1rem 5%",
      backgroundColor: "#fff",
      borderBottom: "1px solid #e0e0e0",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    },
    profileCard: {
      flex: "0 0 300px",
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      padding: "2rem",
      height: "fit-content"
    },
    contentCard: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      padding: "2rem"
    }
  };

const fetchData = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  setSuccess(null);
  try {
    const token = localStorage.getItem('token');
    const teacherCin = localStorage.getItem('teacherCin');

    if (!token || !teacherCin || isNaN(teacherCin)) {
      throw new Error('Données d\'authentification invalides');
    }

    const [teacherRes, examsRes, emploiRes] = await Promise.all([
      axios.get(`${API_URL}/enseignants?cin=${teacherCin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/examens/enseignant/${teacherCin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/emplois/enseignant/${teacherCin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    if (!teacherRes.data.success || !teacherRes.data.data) {
      throw new Error('Données enseignant non valides');
    }

    setTeacherData(teacherRes.data.data);
    setPreviewImage(teacherRes.data.data.ProfileImage || null);

    if (examsRes.data.success) {
      setTeacherExams(examsRes.data.data);
    }

    // Ajoutez cette partie pour stocker l'emploi du temps
    if (emploiRes.data.success && emploiRes.data.data.length > 0) {
      const emploiData = emploiRes.data.data[0]; // Prenez le premier emploi du temps
      setEmploiDuTemps(emploiData); // Stockez les données de l'emploi du temps
      
      const emploiId = emploiData.id;
      if (!emploiId) {
        console.warn('ID emploi du temps manquant');
        return;
      }
      
      const parseRes = await axios.get(
        `${API_URL}/emplois/${emploiId}/parsed`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setParsedSchedule(parseRes.data.data);
    }

  } catch (error) {
    console.error('Erreur complète:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('teacherCin');
      navigate('/connexion');
      return;
    }
    setError('Erreur de chargement des données. Veuillez réessayer.');
  } finally {
    setIsLoading(false);
  }
}, [API_URL, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
  const teacherCin = localStorage.getItem('teacherCin');
  
  if (!token || !teacherCin) {
    navigate('/connexion');
    return;
  }
    
    // Récupération des événements séparément car pas besoin d'authentification
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_URL}/evenements`);
        if (response.data && Array.isArray(response.data.data)) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error("Erreur chargement événements:", error);
      }
    };
    fetchEvents();
    fetchData();
  }, [fetchData, API_URL]);

 // Débouncez les interactions utilisateur complexes
const handleDownloadEmploi = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    const teacherCin = localStorage.getItem('teacherCin');
    
    // Optimisation: Vérifiez d'abord si l'emploi existe
    if (!emploiDuTemps?.fichier_path) {
      console.error("Aucun fichier d'emploi du temps disponible");
      return;
    }

    const response = await axios.get(
      `${API_URL}/emplois/enseignant/${teacherCin}/download`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `emploi_${teacherCin}_${new Date().toISOString().slice(0,10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Erreur téléchargement:", error);
  }
}, [emploiDuTemps, API_URL]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post(`${API_URL}/upload-profile-image`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setPreviewImage(response.data.imageUrl);
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('teacherCin');
    localStorage.removeItem('teacherEmail');
    navigate('/connexion');
  };

  const teacherProfile = teacherData ? {
    name: teacherData.Nom_et_prénom || "Nom non spécifié",
    title: teacherData.Classement || "Enseignant",
    email: teacherData.Email || "Email non spécifié",
    phone: teacherData.Numero_tel ? `+216 ${teacherData.Numero_tel}` : "Non spécifié",
    bio: teacherData.Description || "Aucune description fournie.",
  } : null;

  const getArtGradient = (type) => {
    const gradients = {
      'Conférence': '#8b5cf6, #7c3aed',
      'Atelier': '#ec4899, #db2777',
      'Exposition': '#f59e0b, #d97706',
      'Performance': '#10b981, #059669'
    };
    return gradients[type] || '#6d28d9, #4c1d95';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="body1" style={{ marginLeft: '1rem' }}>
          Chargement de votre profil...
        </Typography>
      </Box>
    );
  }

 // Remplacez votre gestion d'erreur actuelle par :
if (!teacherData) {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      bgcolor="#f8f9fa"
    >
      <Typography variant="h6" color="error" gutterBottom>
        Erreur de chargement des données
      </Typography>
      <Typography variant="body1" gutterBottom>
        {error || 'Veuillez vérifier votre connexion'}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('teacherCin');
          navigate('/connexion');
        }}
        sx={{ mt: 2 }}
      >
        Se reconnecter
      </Button>
    </Box>
  );
}

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src={logoFac}
            width="80"
            height="80"
            alt="Logo Faculté"
            style={{ objectFit: "contain", marginRight: "1rem" }}
          />
          <div style={{ borderLeft: "2px solid #0056b3", paddingLeft: "1rem" }}>
            <Typography variant="h6" style={{ color: "#0056b3", fontWeight: "bold" }}>
              Faculté des Sciences et Techniques FSTSBZ
            </Typography>
            <Typography variant="subtitle2" style={{ color: "#555" }}>
              Université de Kairouan
            </Typography>
          </div>
        </a>

        <div style={{ flexGrow: 1 }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Button 
            href="/teacherUploadDoc" 
            color="primary"
            style={{ fontWeight: "bold" }}
          >
            Diffuser cours
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: "flex", padding: "2rem 5%", gap: "2rem" }}>
        {/* Profile Column */}
        <div style={styles.profileCard}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div 
              style={{
                position: 'relative',
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                backgroundColor: "#e0e0e0",
                margin: "0 auto 1rem",
                overflow: "hidden",
                cursor: 'pointer'
              }} 
              onClick={() => fileInputRef.current.click()}
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Photo de profil" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <FaChalkboardTeacher size={60} color="#555" style={{ marginTop: '45px' }} />
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                textAlign: 'center'
              }}>
                Changer photo
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
              accept="image/*"
            />

            <Typography variant="h5" style={{ color: "#0056b3" }}>
              {teacherProfile.name}
            </Typography>
            <Typography variant="subtitle1" style={{ color: "#666" }}>
              {teacherProfile.title}
            </Typography>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
            <Typography variant="h6" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaUniversity /> Informations
            </Typography>
            <div style={{ marginTop: "1rem" }}>
              <Typography style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MdEmail color="#0056b3" /> {teacherProfile.email}
              </Typography>
              <Typography style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MdPhone color="#0056b3" /> {teacherProfile.phone}
              </Typography>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", marginTop: "1rem", paddingTop: "1rem" }}>
            <Typography variant="h6">À propos</Typography>
            <Typography variant="body1" style={{ color: "#666", lineHeight: "1.6" }}>
              {teacherProfile.bio}
            </Typography>
          </div>
        </div>

        {/* Main Content Column */}
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Welcome Section */}
          <div style={styles.contentCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ flex: "1" }}>
                <Typography variant="h4" style={{ color: "#0056b3", marginBottom: "1rem" }}>
                  Bienvenue, {teacherProfile.name}
                </Typography>
                <Typography variant="body1" style={{ color: "#666", lineHeight: "1.6" }}>
                  Enseigner, c'est semer des graines de savoir qui fleuriront toute une vie.
                  Consultez votre emploi du temps, vos examens à venir et restez à jour avec les dernières actualités.
                </Typography>
              </div>
              <div style={{ width: "200px" }}>
                <Lottie animationData={home} loop={true} />
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          {/* Schedule Section */}
<div style={{ ...styles.contentCard, overflowX: "auto" }}>
  

  {/* Schedule Section */}
<div style={{ ...styles.contentCard, overflowX: "auto" }}>
  {parsedSchedule && emploiDuTemps ? (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Typography variant="h5" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaClock /> Votre emploi du temps
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          href={`${API_URL}${emploiDuTemps.fichier_path}`}
          target="_blank"
        >
          Télécharger
        </Button>
      </div>

      <Typography variant="body1" style={{ marginBottom: '1rem' }}>
        {teacherProfile.name} - {teacherProfile.title}
      </Typography>

      <TableContainer component={Paper} sx={{ 
        margin: '2rem 0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              {parsedSchedule.headers.map((header, idx) => (
                <TableCell 
                  key={idx} 
                  align="center" 
                  sx={{
                    backgroundColor: '#2c3e50',
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
                    backgroundColor: '#f9f9f9'
                  },
                  '&:hover': {
                    backgroundColor: '#f0f7ff'
                  }
                }}
              >
                {parsedSchedule.headers.map((header, colIndex) => (
                  <TableCell 
                    key={`${rowIndex}-${colIndex}`} 
                    align="center"
                    sx={{
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '0.9rem'
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

      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="body1" color="textSecondary">
        Aucun emploi du temps disponible
      </Typography>
    </Paper>
  )}
</div>
</div>

          {/* Exams Section */}
          <div style={styles.contentCard}>
            <Typography variant="h5" style={{ marginBottom: "1rem" }}>
              Vos examens à venir
            </Typography>
            
            {teacherExams.length > 0 ? (
              teacherExams.map((exam, index) => (
                <div 
                  key={index} 
                  style={{
                    padding: "1rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <Typography variant="subtitle1" style={{ color: "#0056b3" }}>
                      {exam.matiere_nom}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#666" }}>
                      {new Date(exam.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {" • " + exam.heure_debut} - {exam.heure_fin}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      {exam.filiere_nom} - {exam.classe_nom} (Semestre {exam.semestre_numero})
                    </Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaBook /> 
                    <Typography variant="body2" style={{ marginRight: '0.5rem' }}>
                      {exam.salle}
                    </Typography>
                    <Tag color={exam.type === 'Examen' ? 'red' : 'blue'}>
                      {exam.type}
                    </Tag>
                  </div>
                </div>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                Aucun examen à venir pour le moment
              </Typography>
            )}
          </div>

          {/* Events Section */}
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Typography variant="h3" style={{ marginBottom: '1rem' }}>
                <span style={{
                  fontWeight: '500',
                  background: 'linear-gradient(90deg, #7e22ce 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Notre Programme
                </span> Culturel
              </Typography>
              <Typography variant="subtitle1" style={{ color: '#64748b' }}>
                Des expériences immersives où l'art rencontre l'innovation
              </Typography>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem'
            }}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} getArtGradient={getArtGradient} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant séparé pour la carte d'événement
const EventCard = ({ event, getArtGradient }) => {
  if (!event || !event.titre || !event.date) return null;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.03)',
        border: '1px solid rgba(226, 232, 240, 0.7)'
      }}
    >
      <div style={{
        height: '200px',
        background: `linear-gradient(45deg, ${getArtGradient(event.type)})`,
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          color: 'white',
          zIndex: 2
        }}>
          <Typography variant="overline" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            {event.type?.toUpperCase() || 'ÉVÉNEMENT'}
          </Typography>
          <Typography variant="h5" style={{ 
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {event.titre}
          </Typography>
        </div>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)'
        }} />
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              backgroundColor: '#f5f3ff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="body1" style={{ color: '#7e22ce', fontWeight: 'bold' }}>
                {new Date(event.date).getDate()}
              </Typography>
              <Typography variant="caption" style={{ color: '#7e22ce' }}>
                {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" style={{ color: '#64748b' }}>
                {new Date(event.date).toLocaleString('fr-FR', { weekday: 'long' })}
              </Typography>
              <Typography variant="body1" style={{ fontWeight: '500' }}>
                {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </div>
          </div>
          <div>
            <Typography variant="body2" style={{
              backgroundColor: '#f5f3ff',
              color: '#7e22ce',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MdLocationOn size={16} />
              {event.lieu || 'Lieu non spécifié'}
            </Typography>
          </div>
        </div>

        <Typography variant="body1" style={{ 
          color: '#64748b', 
          lineHeight: '1.7', 
          marginBottom: '1.5rem',
          minHeight: '60px'
        }}>
          {event.description 
            ? `${event.description.substring(0, 120)}...` 
            : 'Aucune description disponible'}
        </Typography>

        <Button 
          variant="contained" 
          startIcon={<FaTicketAlt />}
          style={{
            backgroundColor: '#7e22ce',
            '&:hover': { backgroundColor: '#6b21a8' }
          }}
        >
          Réserver
        </Button>
      </div>
    </motion.div>
  );
};

export default TeacherProfil;