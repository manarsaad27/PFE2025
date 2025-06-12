import React, { useRef , useState, useEffect  } from "react";
import logoFac from "./../../assets/logoFac.png"
import Lottie from "lottie-react";
import home from "../../assets/lotties/home.json";
import "./../../styles.css";
import licencee from './../../assets/img/licencee.png';
import master from "./../../assets/img/master.png";
import doctorat from "./../../assets/img/doctorat.png";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaFlask, FaHandshake } from "react-icons/fa";

const Home= () => {
 const navigate = useNavigate();
 
   const [isAdmin, setIsAdmin] = useState(false);
   const newsSectionRef = useRef(null);
   const programsSectionRef = useRef(null);
   const contactSectionRef = useRef(null);
 
   const scrollToSection = (ref) => {
     ref.current.scrollIntoView({ behavior: "smooth" });
   };
 
 
   const checkAdminStatus = () => {
     // Implémentez votre logique de vérification ici
     // Par exemple, vérifier dans localStorage ou via une API
     return localStorage.getItem('isAdmin') === 'true';
   };
 
   const handleSeeMore = (programType) => {
     navigate(`/${programType.toLowerCase()}`);
   };
 
   const handleEventClick = (eventName) => {
     navigate('/eventForm', { state: { selectedEvent: eventName } });
   };
 
 
   useEffect(() => {
     setIsAdmin(checkAdminStatus());
   }, []);
 
   const handleAdminClick = () => {
     if (isAdmin) {
       navigate('/admin/dashboard');
     } else {
       navigate('/admin/login');
     }
 
 
   const programs = [
     {
       title: "Licence",
       description: "Découvrir la liste des filières universitaire",
       image: licencee,
       path: "licence",
     },
     {
       title: "Master",
       description: "Explorez notre programme de master",
       image: master,
       path: "master",
     },
     {
       title: "Doctorat",
       description: "Participez à des recherches de pointe",
       image: doctorat,
       path: "doctorat",
     },
   ];
 
   const events = [
     {
       title: "Conférence sur l'IA",
       description: "Rejoignez notre conférence sur l'intelligence artificielle.",
     },
     {
       title: "Atelier de programmation",
       description: "Participez à notre atelier de programmation avancée.",
     },
   ];
   return (
     <div className="home-page">
       <header className="header">
         <a href="/">
           <img src={logoFac} width="80" height="80" alt="Logo de la Faculté" />
         </a>
         <nav className="nav">
           <a href="#formations" onClick={() => scrollToSection(programsSectionRef)}>Formations</a>
           <a href="#evenements" onClick={() => scrollToSection(newsSectionRef)}>Événements</a>
           <a href="#contact" onClick={() => scrollToSection(contactSectionRef)}>Contact</a>
           <a href="/connexion">Se connecter</a>
           <button 
             className="admin-button"
             onClick={handleAdminClick}
           >
             {isAdmin ? 'Espace Admin' : 'Admin'}
           </button>
         </nav>
       </header>
 
       <table>
         <tbody>
           <tr>
             <td>
               <section className="hero-section">
                 <div className="hero-content">
                   <h1>Bienvenue à la Faculté des Sciences et Techniques de Sidi Bouzid</h1>
                   <h4>Formez-vous pour un avenir brillant</h4>
                 </div>
               </section>
             </td>
             <td>
               <div className="image-container">
                 <div>
                   <Lottie animationData={home} loop={true} />
                 </div>
               </div>
             </td>
           </tr>
         </tbody>
       </table>
 
       <section className="about-section">
         <div className="about-container">
           <div className="about-header">
             <h2>Notre Institution</h2>
             <div className="divider"></div>
             <p className="tagline">Excellence académique depuis 2012</p>
           </div>
           
           <div className="about-content">
             <div className="about-image">
               <div className="image-frame">
                 <img 
                   src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                   alt="Campus universitaire" 
                   className="campus-img"
                 />
                 <div className="overlay"></div>
               </div>
             </div>
             
             <div className="about-text">
               <div className="timeline">
                 <div className="timeline-item">
                   <div className="timeline-marker"></div>
                   <div className="timeline-content">
                     <h3>Fondation</h3>
                     <p>Créée le 4 septembre 2012 par décret n°1645</p>
                   </div>
                 </div>
                 <div className="timeline-item">
                   <div className="timeline-marker"></div>
                   <div className="timeline-content">
                     <h3>Affiliation</h3>
                     <p>Établissement rattaché à l'Université de Kairouan</p>
                   </div>
                 </div>
                 <div className="timeline-item">
                   <div className="timeline-marker"></div>
                   <div className="timeline-content">
                     <h3>Mission</h3>
                     <p>Former les leaders scientifiques de demain</p>
                   </div>
                 </div>
               </div>
               
               <div className="mission-cards">
                 <div className="mission-card">
                   <FaGraduationCap className="mission-icon" />
                   <h4>Éducation</h4>
                   <p>Programmes académiques de qualité en sciences et technologies</p>
                 </div>
                 <div className="mission-card">
                   <FaFlask className="mission-icon" />
                   <h4>Recherche</h4>
                   <p>Encouragement à l'innovation et recherche scientifique</p>
                 </div>
                 <div className="mission-card">
                   <FaHandshake className="mission-icon" />
                   <h4>Insertion</h4>
                   <p>Facilitation de l'insertion professionnelle des diplômés</p>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="stats-container">
             {[
               { value: "3000+", label: "Étudiants", icon: "👨‍🎓" },
               { value: "40+", label: "Programmes", icon: "📚" },
               { value: "50+", label: "Partenariats", icon: "🤝" },
               { value: "5+", label: "Laboratoires", icon: "🔬" }
             ].map((stat, index) => (
               <div key={index} className="stat-item">
                 <span className="stat-icon">{stat.icon}</span>
                 <h3>{stat.value}</h3>
                 <p>{stat.label}</p>
               </div>
             ))}
           </div>
         </div>
       </section>
 
       <section className="programs-section" ref={programsSectionRef} id="formations">
         <h2>Nos formations</h2>
         <div className="programs-grid">
           {programs.map((program, index) => (
             <div key={index} className="program-card">
               <Card
                 sx={{
                   maxWidth: 345,
                   height: "100%",
                   display: "flex",
                   flexDirection: "column",
                   justifyContent: "space-between",
                   transition: "transform 0.3s, box-shadow 0.3s",
                   "&:hover": {
                     transform: "translateY(-5px)",
                     boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                   },
                 }}
               >
                 <CardMedia
                   component="img"
                   height="140"
                   image={program.image}
                   alt={program.title}
                   sx={{ objectFit: "cover" }}
                 />
                 <CardContent>
                   <Typography gutterBottom variant="h5" component="div">
                     {program.title}
                   </Typography>
                   <Typography variant="body2" sx={{ color: "text.secondary" }}>
                     {program.description}
                   </Typography>
                 </CardContent>
                 <CardActions sx={{ justifyContent: "flex-end", padding: 2 }}>
                   <Button
                     size="small"
                     color="primary"
                     variant="contained"
                     onClick={() => handleSeeMore(program.path)}
                     sx={{
                       textTransform: "none",
                       fontWeight: "bold",
                       "&:hover": {
                         backgroundColor: "primary.dark",
                       },
                     }}
                   >
                     Voir plus
                   </Button>
                 </CardActions>
               </Card>
             </div>
           ))}
         </div>
       </section>
    
       
 
       <section className="news-section" ref={newsSectionRef} id="evenements">
         <h2>Actualités et événements</h2>
         <div className="news-grid">
           {events.map((event, index) => (
             <div 
               key={index} 
               className="news-card"
               onClick={() => handleEventClick(event.title)}
               style={{ cursor: 'pointer' }}
             >
               <h3>{event.title}</h3>
               <p>{event.description}</p>
               
             </div>
           ))}
         </div>
       </section>
 
       <section className="contact-section" ref={contactSectionRef} id="contact"> {/* Section contact ajoutée */}
         
         {/* Ajoutez ici le contenu de votre section contact */}
       </section>
     </div>
   );
 };
 };
export default Home;