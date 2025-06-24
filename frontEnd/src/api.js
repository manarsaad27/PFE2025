import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      
      if (!window.location.pathname.includes('/admin/login')) {
        console.log('Déclenchement redirection 401', {
          path: window.location.pathname,
          error: error.response.data
        });
        await new Promise(resolve => setTimeout(resolve, 100)); 
        window.location.href = '/admin/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    return Promise.reject(error);
  }
);

export default api;