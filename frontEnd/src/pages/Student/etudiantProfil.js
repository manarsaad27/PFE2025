import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  FaUser, FaCalendarAlt, FaTicketAlt , FaClipboardList, FaSignOutAlt, 
  FaBookOpen, FaBook, FaCamera, FaSyncAlt 
} from "react-icons/fa";
import { MdLocationOn, MdGetApp } from "react-icons/md";
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { 
  Chip, Box, CircularProgress, Button, Typography,
  TableContainer, Paper, Table, TableHead, TableRow, 
  TableCell, TableBody ,   IconButton,
    Badge,
    Popover,
    ClickAwayListener,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { useAuth } from "../../hooks/useAuth";
import logoFac from "./../../assets/logoFac.png";
import { Notifications as NotificationsIcon, Close as CloseIcon } from '@mui/icons-material';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");


// Styles
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
`;

const Sidebar = styled.div`
  width: 280px;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 80px);
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80px;
    padding: 1rem 0;
  }
`;

const NavItem = styled.div`
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  margin: 0.5rem 0;
  font-size: 0.95rem;
  
  ${({ active }) => active && `
    background: rgba(255, 255, 255, 0.1);
    border-left: 4px solid #fff;
    font-weight: 500;
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: center;
    
    span:not(.nav-icon) {
      display: none;
    }
  }
`;

const NavIcon = styled.span`
  width: 24px;
  display: flex;
  justify-content: center;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #f1f1f1;
`;

const ProfileContainer = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProfilePhoto = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #ecf0f1;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileDetails = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const DetailItem = styled.div`
  background: #f8f9fa;
  padding: 1.2rem;
  border-radius: 8px;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
  word-break: break-all;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f8f9fa;
`;

const Spinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const DownloadButton = styled(Button)`
  && {
    background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
    color: white;
    padding: 8px 20px;
    border-radius: 8px;
    text-transform: none;
    font-weight: 500;
  }
`;

const EtudiantProfil = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const anchorEl = useRef(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingEmploi, setLoadingEmploi] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [filiereData, setFiliereData] = useState({});
  const [classeData, setClasseData] = useState({});
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [parsedSchedule, setParsedSchedule] = useState(null);
  const [errorEmploi, setErrorEmploi] = useState(null);
  const fileInputRef = useRef();
  const [enCoursUpload, setEnCoursUpload] = useState(false);
  const [apercu, setApercu] = useState(null);
  const [exams, setExams] = useState([]);
  const { token, role, cin } = useAuth('etudiant');
// Charger les notifications
const loadNotifications = async () => {
  try {
    const { data } = await axios.get(`enseignant/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(data.data);
    setUnreadCount(data.data.filter((n) => !n.read_status).length);
  } catch (error) {
    console.error("Erreur lors du chargement des notifications:", error);
  }
};

// Gérer l'ouverture/fermeture du popover
const handleToggleNotifications = () => {
  setOpen(!open);
  if (hasNewNotification) {
    setHasNewNotification(false);
  }
};

const handleCloseNotifications = () => {
  setOpen(false);
};

// Marquer une notification comme lue
const markAsRead = async (id) => {
  try {
    await axios.patch(`enseignant/notifications/${id}/read`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read_status: true} : n
    ));
    setUnreadCount(unreadCount - 1);
  } catch (error) {
    console.error("Erreur lors du marquage comme lu:", error);
  }
};

// Dans useEffect, ajoutez la gestion des sockets
useEffect(() => {
  socket.emit("registerAsTeacher", { cin });
  socket.on("newNotification", (data) => {
    setNotifications((prev) => [data, ...prev]);
    setHasNewNotification(true);
    setUnreadCount(prev => prev + 1);
  });

  return () => {
    socket.off("newNotification");
  };
}, [cin]);

// Charger les notifications au montage et toutes les 30 secondes
useEffect(() => {
  loadNotifications();
  const interval = setInterval(loadNotifications, 30000);
  return () => clearInterval(interval);
}, []);
  const loadReferenceData = useCallback(async () => {
    try {
      const [filieresRes, classesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/filieres'),
        axios.get('http://localhost:5000/api/classes')
      ]);

      const filieresMap = {};
      filieresRes.data.data.forEach(f => filieresMap[f.id] = f.nom);
      const classesMap = {};
      classesRes.data.forEach(c => classesMap[c.id] = c.nom);

      setFiliereData(filieresMap);
      setClasseData(classesMap);
    } catch (error) {
      console.error("Erreur chargement données référence:", error);
    }
  }, []);

  const fetchEmploiDuTemps = useCallback(async () => {
    try {
      setLoadingEmploi(true);
      const token = localStorage.getItem('token');
      if (!token || !studentData?.profile?.classeNom) return;

      const response = await axios.get(
        `http://localhost:5000/api/emplois/classe/${studentData.profile.classeNom}?type=etudiant`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success && response.data.data.length > 0) {
        setEmploiDuTemps(response.data.data[0]);
        
        const parseRes = await axios.get(
          `http://localhost:5000/api/emplois/${response.data.data[0].id}/parsed`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setParsedSchedule(parseRes.data.data);
      }
    } catch (error) {
      console.error("Erreur chargement emploi du temps:", error);
      setErrorEmploi("Impossible de charger l'emploi du temps");
    } finally {
      setLoadingEmploi(false);
    }
  }, [studentData?.profile?.classeNom]);

  useEffect(() => {
    if (studentData?.profile?.classeNom) {
      fetchEmploiDuTemps();
    }
  }, [studentData?.profile?.classeNom, fetchEmploiDuTemps]);

  const fetchData = useCallback(async () => {
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
            filiereNom: filiereData[response.data.data.Filière] || response.data.data.Filière,
            classeNom: classeData[response.data.data.Classe] || response.data.data.Classe,
            ProfileImage: response.data.data.ProfileImage || null
          }
        });

        const examsResponse = await axios.get(`http://localhost:5000/api/examens/etudiant/${cin}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (examsResponse.data.success) {
  setExams(examsResponse.data.data);
}
      }

      const eventsRes = await axios.get("http://localhost:5000/api/evenements");
      setEvents(eventsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  }, [filiereData, classeData]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await loadReferenceData();
        await fetchData();
        await fetchEmploiDuTemps();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [loadReferenceData, fetchData, fetchEmploiDuTemps]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentCin');
    localStorage.removeItem('role');
    navigate('/connexion');
  };

  const navigateToDocuments = () => {
    const token = localStorage.getItem('token');
    const cin = localStorage.getItem('studentCin');
    
    if (!token || !cin) {
      navigate('/connexion');
    } else {
      navigate('/studentDoc');
    }
  };

  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };

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
      setEnCoursUpload(true);

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
    } finally {
      setEnCoursUpload(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Chargement de votre profil...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </LoadingContainer>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar standard */}
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
          <IconButton
            ref={anchorEl}
            onClick={handleToggleNotifications}
            style={{
              position: 'relative',
              color: '#0056b3',
              '&:hover': {
                backgroundColor: 'rgba(0, 86, 179, 0.1)'
              }
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              invisible={unreadCount === 0}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Popover
            open={open}
            anchorEl={anchorEl.current}
            onClose={handleCloseNotifications}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              style: {
                width: 400,
                maxHeight: '70vh',
                overflow: 'auto',
                padding: '1rem',
                borderRadius: '10px',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.15)'
              }
            }}
          >
            <ClickAwayListener onClickAway={handleCloseNotifications}>
              <Box>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <Typography variant="h6" style={{ color: '#0056b3' }}>
                    Notifications
                  </Typography>
                  <IconButton onClick={handleCloseNotifications} size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Divider style={{ marginBottom: '1rem' }} />

                {notifications.length === 0 ? (
                  <Typography variant="body2" style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
                    Aucune notification pour le moment
                  </Typography>
                ) : (
                  <List dense>
                    {notifications.map((notification, index) => (
                      <React.Fragment key={notification.id || index}>
                        <ListItem
                          style={{
                            backgroundColor: notification.read_status ? 'inherit' : 'rgba(0, 86, 179, 0.05)',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 86, 179, 0.1)'
                            }
                          }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" style={{ color: '#0056b3' }}>
                                {notification.title || "Notification"}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" style={{ color: '#666' }}>
                                {notification.message}
                              </Typography>
                            }
                            secondaryTypographyProps={{
                              style: {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                        </ListItem>
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </ClickAwayListener>
          </Popover>
        </div>










      </header>

      {/* Contenu principal */}
      <Container>
        <Sidebar>
          <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
            <Typography variant="h6" style={{ color: 'white', fontWeight: 'bold' }}>
              Menu Étudiant
            </Typography>
          </div>
          
          <NavItem 
            active={activeSection === 'profile'} 
            onClick={() => setActiveSection('profile')}
          >
            <NavIcon><FaUser /></NavIcon>
            <span>Profil</span>
          </NavItem>
          
          <NavItem 
            active={activeSection === 'schedule'} 
            onClick={() => setActiveSection('schedule')}
          >
            <NavIcon><FaCalendarAlt /></NavIcon>
            <span>Emploi du temps</span>
          </NavItem>
          
          <NavItem 
            active={activeSection === 'exams'} 
            onClick={() => setActiveSection('exams')}
          >
            <NavIcon><FaClipboardList /></NavIcon>
            <span>Examens</span>
          </NavItem>
          
          <NavItem 
            active={activeSection === 'events'} 
            onClick={() => setActiveSection('events')}
          >
            <NavIcon><FaCalendarAlt /></NavIcon>
            <span>Événements</span>
          </NavItem>
          
          <NavItem onClick={navigateToDocuments}>
            <NavIcon><FaBookOpen /></NavIcon>
            <span>Documents de cours</span>
          </NavItem>
          
          <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
            <NavItem 
              onClick={handleLogout}
              style={{ 
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                borderLeft: '4px solid tomato'
              }}
            >
              <NavIcon><FaSignOutAlt style={{ color: 'tomato' }} /></NavIcon>
              <span style={{ color: 'tomato', fontWeight: 'bold' }}>Déconnexion</span>
            </NavItem>
          </div>
        </Sidebar>

        <MainContent>
          {activeSection === 'profile' && studentData && (
            <Section>
              <SectionTitle>Informations personnelles</SectionTitle>
              <ProfileContainer>
                <ProfilePhoto>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {enCoursUpload ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      backgroundColor: '#f0f0f0'
                    }}>
                      <CircularProgress />
                    </div>
                  ) : studentData?.profile?.ProfileImage ? (
                    <img
                      src={`http://localhost:5000${studentData.profile.ProfileImage}`}
                      alt="Photo de profil"
                      onClick={() => fileInputRef.current.click()}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        cursor: 'pointer' 
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        cursor: 'pointer'
                      }}
                    >
                      <FaCamera size={40} color="#666" />
                      <span style={{ marginTop: 10, color: '#666' }}>Ajouter une photo</span>
                    </div>
                  )}
                </ProfilePhoto>

                <ProfileDetails>
                  <DetailItem>
                    <DetailLabel>Nom complet</DetailLabel>
                    <DetailValue>{studentData.profile.Nom_et_prénom}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>CIN</DetailLabel>
                    <DetailValue>{studentData.profile.CIN}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Email</DetailLabel>
                    <DetailValue>
                      {studentData.profile.Email || 'Non renseigné'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Téléphone</DetailLabel>
                    <DetailValue>{studentData.profile.Téléphone}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>FILIÈRE</DetailLabel>
                    <DetailValue>{studentData.profile.filiereNom}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>CLASSE</DetailLabel>
                    <DetailValue>{studentData.profile.classeNom}</DetailValue>
                  </DetailItem>
                </ProfileDetails>
              </ProfileContainer>
            </Section>
          )}

          {activeSection === 'schedule' && (
            <Section>
              <SectionTitle>Votre emploi du temps</SectionTitle>
              {loadingEmploi ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <CircularProgress />
                </div>
              ) : emploiDuTemps && parsedSchedule ? (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem' 
                  }}>
                    <Typography variant="body1" gutterBottom>
                      {emploiDuTemps.filiere_nom} - {emploiDuTemps.classe_nom} - Semestre {emploiDuTemps.semestre_numero}
                    </Typography>
                    <DownloadButton 
                      variant="contained" 
                      startIcon={<MdGetApp />}
                      href={`http://localhost:5000${emploiDuTemps.fichier_path}`}
                      target="_blank"
                    >
                      Télécharger
                    </DownloadButton>
                  </div>

                  <TableContainer component={Paper} sx={{ 
                    margin: '2rem 0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {parsedSchedule.headers.map((header, index) => (
                            <TableCell 
                              key={index} 
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

                  <Typography variant="body2" color="textSecondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCalendarAlt />
                    Dernière mise à jour : {new Date(emploiDuTemps.published_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </div>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Aucun emploi du temps disponible pour le moment
                </Typography>
              )}
            </Section>
          )}

          {activeSection === 'exams' && (
            <Section>
              <SectionTitle>Vos examens à venir</SectionTitle>
              
              {loadingExams ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <CircularProgress />
                </div>
              ) : exams.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  Aucun examen à venir pour le moment
                </Typography>
              ) : (
                exams.map((exam, index) => (
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
                      <Chip
                        label={exam.type}
                        color={exam.type === 'Examen' ? 'error' : 'primary'}
                        size="small"
                      />
                    </div>
                  </div>
                ))
              )}
            </Section>
          )}

          {activeSection === 'events' && (
            <Section>
              <SectionTitle>Événements Universitaires</SectionTitle>
              
              {events.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  Aucun événement à venir pour le moment
                </Typography>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {events.map((event) => {
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <motion.div 
                        key={event.id}
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ 
                          height: '180px',
                          position: 'relative',
                          overflow: 'hidden',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#6366f1',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {event.type}
                          </div>
                        </div>
                        
                        <div style={{ padding: '1.5rem' }}>
                          <h3 style={{ 
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 1rem 0'
                          }}>
                            {event.titre}
                          </h3>
                          
                          <div style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            marginBottom: '1.25rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaCalendarAlt color="#6366f1" />
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {formattedDate} à {formattedTime}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <MdLocationOn color="#6366f1" />
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {event.lieu}
                              </span>
                            </div>
                          </div>
                          
                          <p style={{ 
                            color: '#6b7280',
                            fontSize: '0.9375rem',
                            lineHeight: '1.6',
                            marginBottom: '1.5rem'
                          }}>
                            {event.description.length > 150 
                              ? `${event.description.substring(0, 150)}...` 
                              : event.description}
                          </p>
                          
                          <button 
                            onClick={() => handleEventClick(event.titre)}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9375rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <FaTicketAlt /> S'inscrire
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}
        </MainContent>
      </Container>
    </div>
  );
};

export default EtudiantProfil;