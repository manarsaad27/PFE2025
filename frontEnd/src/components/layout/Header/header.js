import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaFlask, FaUser } from 'react-icons/fa';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IMG from "../../../assets/img/IMG.JPG";
import logoFac from "./../../../assets/logoFac.png";
import faculte from "./../../../assets/img/faculte.JPG"; 
import facultee from "./../../../assets/img/facultee.JPG"; 
import faculté from "./../../../assets/img/faculté.JPG";
import { useAuth } from '../../../hooks/AuthContext';
const Header = () => {
  const [activeImage, setActiveImage] = useState(0);
  const images = [faculte, facultee, faculté];
  const navigate = useNavigate();
const { isAuthenticated, role, logout } = useAuth();
  

  const handleProfileClick = () => {
  if (role === 'enseignant') {
    navigate('/teacherProfil');
  } else if (role === 'etudiant') {
    navigate('/etudiantProfil');
  } else if (role === 'admin') {
    navigate('/adminDashboard');
  }
};

  const handleLoginClick = () => {
    navigate('/connexion');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div>
      {/* Header Section */}
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
        
        {isAuthenticated ? (
  <Button 
    variant="contained" 
    startIcon={<FaUser />}
    onClick={handleProfileClick}
    style={{ 
      backgroundColor: '#0056b3',
      color: 'white',
      fontWeight: 'bold',
      textTransform: 'none'
    }}
  >
    Profil
  </Button>
) : (
  <Button 
    variant="contained" 
    color="primary"
    onClick={handleLoginClick}
    style={{ fontWeight: "bold" }}
  >
    Se connecter
  </Button>
)}
      </header>

      {/* Scrolling Banner */}
      <div style={{
        backgroundColor: "#0056b3",
        overflow: "hidden",
        whiteSpace: "nowrap",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "1rem",
        padding: "0.5rem 0",
        borderBottom: "3px solid #003e80",
        position: "sticky",
        top: "80px",
        zIndex: 1000,
        width: "100%"
      }}>
        <div style={{
          display: "inline-block",
          paddingLeft: "100%",
          animation: "scrollText 15s linear infinite"
        }}>
          Bienvenue à la Faculté des Sciences et Techniques de Sidi Bouzid FSTSBZ — Excellence, Innovation, Avenir.
        </div>
      </div>

      <style>{`
        @keyframes scrollText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${IMG})`,
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
        marginTop: '-3px'
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
          }}>Un établissement d'excellence académique dédié à la formation des leaders scientifiques de demain.</p>
          <p style={{
            fontSize: '1.5rem',
            opacity: '0.9',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>Excellence académique, innovation et recherche de pointe</p>
        </div>
      </section>

      {/* Institution Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#fff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: '#1e3c72',
              fontWeight: '600',
              marginBottom: '10px'
            }}>Notre faculté</h2>
            <div style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#f1c40f',
              margin: '0 auto 15px'
            }}></div>
            <p style={{
              fontSize: '1.2rem',
              color: '#666',
              fontStyle: 'italic'
            }}>Excellence académique depuis 2012</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '50px',
            marginBottom: '60px',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative',
              height: '400px',
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                width: `${images.length * 100}%`,
                height: '100%',
                transform: `translateX(-${activeImage * (100 / images.length)}%)`,
                transition: 'transform 0.8s ease-in-out'
              }}>
                {images.map((img, index) => (
                  <div key={index} style={{
                    width: `${100 / images.length}%`,
                    height: '100%',
                    position: 'relative'
                  }}>
                    <img 
                      src={img}
                      alt={`Campus universitaire ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(30,60,114,0.1), rgba(30,60,114,0.3))'
                    }}></div>
                  </div>
                ))}
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px'
              }}>
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: index === activeImage ? '#1e3c72' : 'rgba(255,255,255,0.5)',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div style={{
              padding: '20px'
            }}>
              <div style={{
                position: 'relative',
                paddingLeft: '30px',
                marginBottom: '40px'
              }}>
                <div style={{
                  position: 'relative',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    top: '5px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#1e3c72',
                    border: '4px solid #f0f7ff'
                  }}></div>
                  <div style={{
                    padding: '10px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <h3 style={{
                      color: '#1e3c72',
                      marginBottom: '5px',
                      fontSize: '1.2rem'
                    }}>Fondation</h3>
                    <p style={{
                      color: '#555',
                      fontSize: '0.95rem'
                    }}>Crée le 4 septembre 2012 par décret n°1645</p>
                  </div>
                </div>
                <div style={{
                  position: 'relative',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    top: '5px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#1e3c72',
                    border: '4px solid #f0f7ff'
                  }}></div>
                  <div style={{
                    padding: '10px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <h3 style={{
                      color: '#1e3c72',
                      marginBottom: '5px',
                      fontSize: '1.2rem'
                    }}>Affiliation</h3>
                    <p style={{
                      color: '#555',
                      fontSize: '0.95rem'
                    }}>Établissement rattaché à l'Université de Kairouan</p>
                  </div>
                </div>
                <div style={{
                  position: 'relative',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    top: '5px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#1e3c72',
                    border: '4px solid #f0f7ff'
                  }}></div>
                  <div style={{
                    padding: '10px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <h3 style={{
                      color: '#1e3c72',
                      marginBottom: '5px',
                      fontSize: '1.2rem'
                    }}>Mission</h3>
                    <p style={{
                      color: '#555',
                      fontSize: '0.95rem'
                    }}>Former les leaders scientifiques de demain</p>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '25px 20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }
                }}>
                  <FaGraduationCap style={{
                    fontSize: '2rem',
                    color: '#1e3c72',
                    marginBottom: '15px'
                  }} />
                  <h4 style={{
                    color: '#1e3c72',
                    fontSize: '1.1rem',
                    marginBottom: '10px'
                  }}>Éducation</h4>
                  <p style={{
                    color: '#555',
                    fontSize: '0.9rem'
                  }}>Programmes académiques de qualité en sciences et technologies</p>
                </div>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '25px 20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  ':hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }
                }}>
                  <FaFlask style={{
                    fontSize: '2rem',
                    color: '#1e3c72',
                    marginBottom: '15px'
                  }} />
                  <h4 style={{
                    color: '#1e3c72',
                    fontSize: '1.1rem',
                    marginBottom: '10px'
                  }}>Recherche</h4>
                  <p style={{
                    color: '#555',
                    fontSize: '0.9rem'
                  }}>Encouragement à l'innovation et recherche scientifique</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            textAlign: 'center',
            marginTop: '60px'
          }}>
            {[
              { value: "1500+", label: "Étudiants", icon: "👨‍🎓" },
              { value: "40+", label: "Programmes", icon: "📚" },
              { value: "10+", label: "Partenariats", icon: "🤝" },
              { value: "5+", label: "Laboratoires", icon: "🔬" }
            ].map((stat, index) => (
              <div key={index} style={{
                padding: '30px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontSize: '2rem',
                  display: 'block',
                  marginBottom: '15px'
                }}>{stat.icon}</span>
                <h3 style={{
                  fontSize: '2.2rem',
                  color: '#1e3c72',
                  margin: '0 0 5px',
                  fontWeight: '700'
                }}>{stat.value}</h3>
                <p style={{
                  color: '#666',
                  fontSize: '1rem',
                  margin: 0
                }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#fff'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '20px',
          color: '#1e3c72',
          fontWeight: '600',
          position: 'relative',
          paddingBottom: '15px'
        }}>Nos Valeurs Fondamentaux</h2>
        <div style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#f1c40f',
              margin: '0 auto 15px'
            }}></div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px',
          maxWidth: '1200px',
          margin: '40px auto 0'
        }}>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            textAlign: 'center',
            ':hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>🏛</div>
            <h3 style={{
              color: '#1e3c72',
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600'
            }}>Tradition</h3>
            <p style={{
              color: '#555',
              fontSize: '1rem'
            }}>
              Un héritage académique riche combiné à des méthodes d'enseignement éprouvées pour une formation solide.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            textAlign: 'center',
            ':hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>🌍</div>
            <h3 style={{
              color: '#1e3c72',
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600'
            }}>Ouverture</h3>
            <p style={{
              color: '#555',
              fontSize: '1rem'
            }}>
              Une vision internationale avec des échanges universitaires et des programmes multiculturels.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            textAlign: 'center',
            ':hover': {
              transform: 'translateY(-10px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>⚡</div>
            <h3 style={{
              color: '#1e3c72',
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: '600'
            }}>Innovation</h3>
            <p style={{
              color: '#555',
              fontSize: '1rem'
            }}>
              Des laboratoires high-tech et des méthodes pédagogiques innovantes pour préparer l'avenir.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '20px',
            color: '#fff',
            fontWeight: '600',
            position: 'relative',
            paddingBottom: '15px'
          }}>
            Nos Formations
          </h2>
          <div style={{
            width: '80px',
            height: '4px',
            backgroundColor: '#f1c40f',
            margin: '15px auto 0',
            borderRadius: '2px'
          }}></div>
          <p style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.85)',
            maxWidth: '800px',
            margin: '0 auto 50px',
            lineHeight: '1.6'
          }}>
            Des programmes académiques conçus pour former les experts de demain et répondre aux défis scientifiques contemporains
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginTop: '40px'
          }}>
            {/* Licence */}
            <div style={{
              background: '#fff',
              padding: '35px 30px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              borderTop: '5px solid #3498db',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e8f4fc',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{
                    fontSize: '1.8rem',
                    color: '#3498db'
                  }}>🎓</span>
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  margin: 0
                }}>Licence</h3>
              </div>
              
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {['Science de l\'Informatique "Computer Science"', 'Technologies de l\'Information et de la Communication', 'Physique Chimie', 'Technologies Agroalimentaires et Environnement'].map((item, index) => (
                  <li key={index} style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.05rem',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3498db',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Master */}
            <div style={{
              background: '#fff',
              padding: '35px 30px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              borderTop: '5px solid #e74c3c',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fdedec',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{
                    fontSize: '1.8rem',
                    color: '#e74c3c'
                  }}>🔬</span>
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  margin: 0
                }}>Master</h3>
              </div>
              
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {['Mastère de recherche Informatique décisionnel', 'Mastère professionnel en procédés de contrôle qualité alimentaire', 'Mastère recherche Physique et Chimie des matériaux de hautes performances'].map((item, index) => (
                  <li key={index} style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.05rem',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#e74c3c',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Doctorat */}
            <div style={{
              background: '#fff',
              padding: '35px 30px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              borderTop: '5px solid #2ecc71',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e8f8f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{
                    fontSize: '1.8rem',
                    color: '#2ecc71'
                  }}>📚</span>
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  margin: 0
                }}>Doctorat</h3>
              </div>
              
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {['Informatique et Systèmes',  'Chimie des Matériaux', 'Biologie Moléculaire'].map((item, index) => (
                  <li key={index} style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '1.05rem',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#2ecc71',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;