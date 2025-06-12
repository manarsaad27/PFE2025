import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoFac from "./../../assets/logoFac.png";


import downloadImage from "./../../assets/img/téléchargement.jpeg";

const Etudiant = () => {
  const newsSectionRef = useRef(null);

  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const handleLoginClick = () => {
    
    console.log("Bouton de connexion cliqué");
  };

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



  const handleEventClick = (eventName) => {
    navigate('/eventForm', { state: { selectedEvent: eventName } });
  };


  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      {/* Navbar */}
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

        <div style={{ flexGrow: 13 }}></div>
        <a href='/etudiantProfil'>
          <button
            onClick={handleLoginClick}
            style={{
              background: "linear-gradient(to right, #0056b3, #0077cc)",
              color: "white",
              border: "none",
              padding: "0.7rem 1.8rem",
              borderRadius: "30px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 3px 6px rgba(0, 86, 179, 0.2)",
              letterSpacing: "0.5px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #004494, #0066b3)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 86, 179, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #0056b3, #0077cc)";
              e.currentTarget.style.boxShadow = "0 3px 6px rgba(0, 86, 179, 0.2)";
            }}
          >
            Profil
          </button>
        </a>


        <div style={{ flexGrow: 1 }}></div>
        <a href="/studentDoc" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
        }}>
          
          <div style={{
            
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
            }}>Voir cours</span>
           
          </div>
        </a>

        
        
      </header>

      {/* Hero Section avec image de fond */}
            <section style={{
              background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${downloadImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              marginTop: '-3px' // Compensation pour la bande défilante
            }}>
              <div style={{
                maxWidth: '800px',
                padding: '20px',
                zIndex: 2
              }}>
                <p style={{
                  fontSize: '2.5rem',
                  marginBottom: '20px',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                }}>    Un établissement d'excellence académique dédié à la formation des leaders scientifiques de demain.</p>
                <p style={{
                  fontSize: '1.5rem',
                  opacity: '0.9',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                }}>Excellence académique, innovation et recherche de pointe</p>
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

        
            </div>
            
  );
};
export default Etudiant;