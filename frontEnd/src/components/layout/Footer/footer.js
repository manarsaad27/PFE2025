import React, { useState } from "react";
import {
  FaFacebook,
  FaMapMarkerAlt,
  FaLifeRing,
  FaPaperPlane,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from 'axios';
export default function Footer() {
  const [formData, setFormData] = useState({ email: "", problem: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/reclamations',
        {
          email: formData.email,
          message: formData.problem,
          userType: formData.userType
        }
      );
  
      if (response.data.success) {
        setIsSubmitted(true);
        setFormData({ email: '', problem: '', userType: 'autre' });
        setTimeout(() => setIsSubmitted(false), 3000);
      } else {
        alert(`Erreur: ${response.data.message || "Réponse inattendue du serveur"}`);
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      
      let errorMessage = "Une erreur est survenue lors de l'envoi du problème";
      
      if (error.response) {
        errorMessage = error.response.data.message || 
                    ` Erreur ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur - vérifiez votre connexion";
      }
      
      alert(errorMessage);
    }
  };

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #1e2a3a 0%, #0f1721 100%)",
        color: "#f8f9fa",
        padding: "2rem 1rem 1rem",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top border */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)",
          backgroundSize: "200% 300%",
          animation: "gradient 8s ease infinite",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "2rem auto 1rem",
        }}
      >
        {/* Contact */}
        <div style={{ flex: "1 1 250px", minWidth: "250px" }}>
          <h3 style={{ color: "#4285F4", fontSize: "1.1rem", marginBottom: "1rem" }}>
            <FaEnvelope /> Contact
          </h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "0.9rem" }}>
            <li style={{ marginBottom: "10px" }}>
              <FaEnvelope style={{ marginRight: "8px", color: "#4285F4" }} />
              fstsbz.contact@fstsbz.u-kairouan.tn
            </li>
            <li style={{ marginBottom: "10px" }}>
              <FaPhoneAlt style={{ marginRight: "8px", color: "#4285F4" }} />
              76 636 260
            </li>
            <li>
              <FaMapMarkerAlt style={{ marginRight: "8px", color: "#4285F4" }} />
              Campus Universitaire, Cité Agricole, Sidi Bouzid
            </li>
          </ul>
        </div>

        {/* Réseaux */}
        <div style={{ flex: "1 1 150px", minWidth: "150px" }}>
          <h3 style={{ color: "#4285F4", fontSize: "1.1rem", marginBottom: "1rem" }}>
            <FaMapMarkerAlt /> Réseaux
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a
              href="https://www.facebook.com/profile.php?id=61554467716200"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#f8f9fa", fontSize: "1.5rem" }}
              className="social-icon"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.google.com/maps?q=Campus+Universitaire+cité+agricole+Sidi+Bouzid+TUNISIE"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#f8f9fa", fontSize: "1.5rem" }}
              className="social-icon"
            >
              <FaMapMarkerAlt />
            </a>
          </div>
        </div>

        {/* Formulaire */}
        <div
          style={{
            flex: "1 1 300px",
            minWidth: "280px",
            background: "rgba(255,255,255,0.05)",
            padding: "1rem",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              color: "#34A853",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            <FaLifeRing /> Support
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#ccc", marginBottom: "1rem" }}>
            Décrivez tout problème technique que vous rencontrez.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: "#2e7d32",
                padding: "0.5rem",
                color: "#fff",
                borderRadius: "5px",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              Merci, votre problème a été envoyé.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Votre email"
                style={{
                  padding: "0.6rem",
                  borderRadius: "5px",
                  border: "none",
                  background: "#233344",
                  color: "#fff",
                }}
              />
              <textarea
                name="problem"
                required
                value={formData.problem}
                onChange={handleChange}
                rows="3"
                placeholder="Décrivez le problème..."
                style={{
                  padding: "0.6rem",
                  borderRadius: "5px",
                  border: "none",
                  background: "#233344",
                  color: "#fff",
                }}
              ></textarea>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "linear-gradient(to right, #4285F4, #34A853)",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0.6rem",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <FaPaperPlane /> Envoyer
              </motion.button>
            </form>
          )}
        </div>
      </div>

      {/* Footer bas */}
      <div
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontSize: "0.8rem",
          color: "#bbb",
        }}
      >
        © {new Date().getFullYear()} Faculté des Sciences et Technologies — Tous droits réservés.
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .social-icon:hover {
          transform: scale(1.1);
          color: #34A853 !important;
        }

        @media (max-width: 768px) {
          footer {
            padding: 1.5rem 1rem;
          }
          h3 {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
}