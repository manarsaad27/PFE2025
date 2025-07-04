import React, { useState } from 'react';
import './../../styles.css'; 

function Navbar() {
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        
      </div>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <a href="/">Accueil</a>
        <a href="/formations">Formations</a>
        <a href="/admissions">Admissions</a>
        <a href="/recherche">Recherche</a>
        <a href="/actualites">Actualités</a>
        <a href="/contact">Contact</a>
      </div>

      {/* Bouton de connexion */}
      <div className="navbar-actions">
        <button className="cta-button">Se connecter</button>
      </div>

      {/* Menu déroulant (visible sur les petits écrans) */}
      <div className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="navbar-toggle-icon">{isOpen ? '✕' : '☰'}</span>
      </div>
    </nav>



  );
}

export default Navbar;