// src/services/apiAdmin.js
import axios from 'axios';

const API_BASE_URL = '/api/admin';

export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    throw new Error('Échec de la récupération des statistiques');
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    throw new Error('Échec de la récupération des utilisateurs');
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error('Échec de la mise à jour du rôle');
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}`);
  } catch (error) {
    throw new Error('Échec de la suppression de l\'utilisateur');
  }
};