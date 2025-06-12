import React, { useState } from 'react';

const EventRegistrationForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    cin: '',
    email: '',
    tele: '',
    sexe: '',
    niveauEtude: ''
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation frontend
    if (!formData.nom || !formData.cin || !formData.email || !formData.tele || !formData.sexe || !formData.niveauEtude) {
      setSubmitStatus('error');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          cin: formData.cin,
          email: formData.email,
          tele: formData.tele,
          sexe: formData.sexe,
          niveauEtude: formData.niveauEtude
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
  
      setSubmitStatus('success');
      setFormData({ 
        nom: '', 
        cin: '', 
        email: '', 
        tele: '', 
        sexe: '', 
        niveauEtude: '' 
      });
  
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitStatus('error');
      // Vous pouvez ajouter un state pour afficher le message d'erreur spécifique
      // setErrorMessage(error.message);
    }
  };
  return (
    <div style={{
      maxWidth: '500px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h2 style={{ textAlign: 'center' }}>Inscription aux Événements</h2>
      
      {submitStatus === 'success' && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px'
        }}>
          Inscription réussie! 
        </div>
      )}

      {submitStatus === 'error' && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          erreur leur de l'inscription .
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Nom complet 
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Cin
          </label>
          <input
            type="text"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Email 
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Numéro de téléphone 
          </label>
          <input
            type="tel"
            name="tele"
            value={formData.tele}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        {/* Boutons radio pour le sexe */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Sexe
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="sexe"
                value="homme"
                checked={formData.sexe === 'homme'}
                onChange={handleChange}
                style={{ marginRight: '5px' }}
                required
              />
              Homme
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="sexe"
                value="femme"
                checked={formData.sexe === 'femme'}
                onChange={handleChange}
                style={{ marginRight: '5px' }}
                required
              />
              Femme
            </label>
          </div>
        </div>

        {/* Liste déroulante pour le niveau d'étude */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Niveau d'étude
          </label>
          <select
            name="niveauEtude"
            value={formData.niveauEtude}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          >
            <option value="">Sélectionnez votre niveau</option>
            <option value="Licence">Licence</option>
            <option value="Master">Master</option>
            <option value="Doctorat">Doctorat</option>
            <option value="Enseignant">Enseignant</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default EventRegistrationForm;