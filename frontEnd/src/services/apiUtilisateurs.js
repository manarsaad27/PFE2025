import axios from 'axios';

const API_URL = '/api/utilisateurs';

export const fetchUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Échec de la récupération des utilisateurs');
  }
};

export const fetchUser = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Échec de la récupération de l\'utilisateur');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error('Échec de la mise à jour du rôle');
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Échec de la suppression de l\'utilisateur');
  }
};