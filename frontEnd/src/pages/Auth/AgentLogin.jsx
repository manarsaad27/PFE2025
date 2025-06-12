import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AgentLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/agents/login', credentials);
      
      if (response.data.success) {
        // Stocker le token et les infos de l'agent
        localStorage.setItem('token', response.data.token); 
        localStorage.setItem('agentToken', response.data.token);
        localStorage.setItem('agentInfo', JSON.stringify(response.data.agent));
        
        // Rediriger vers le tableau de bord
        navigate('/agent/dashboard');
      } else {
        setError(response.data.message || 'Échec de la connexion');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  // Styles JSX
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px'
    },
    title: {
      textAlign: 'center',
      marginBottom: '24px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px'
    },
    button: {
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      padding: '12px',
      width: '100%',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s'
    },
    buttonHover: {
      backgroundColor: '#0052a3'
    },
    buttonDisabled: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed'
    },
    alert: {
      color: '#721c24',
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '20px'
    },
    links: {
      marginTop: '20px',
      textAlign: 'center',
      fontSize: '14px'
    },
    link: {
      color: '#0066cc',
      textDecoration: 'none'
    },
    divider: {
      margin: '0 8px',
      color: '#ccc'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Connexion Agent</h2>
        {error && <div style={styles.alert}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email Professionnel</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Entrez votre email professionnel"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Entrez votre mot de passe"
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = styles.button.backgroundColor)}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div style={styles.links}>
          <a href="/agent/forgot-password" style={styles.link}>Mot de passe oublié ?</a>
          
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;