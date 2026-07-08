// ===========================================
// SERVICE AUTHENTIFICATION
// ===========================================

import api from './api';

const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
};

const getMe = async () => {
    const response = await api.get('/auth/me');
    return response;
};

const logout = async () => {
    const response = await api.post('/auth/logout');
    return response;
};

// Vérifier si l'utilisateur est authentifié
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Obtenir le token
const getToken = () => {
    return localStorage.getItem('token');
};

// Obtenir les infos de l'admin
const getAdmin = () => {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
};

export default {
    login,
    getMe,
    logout,
    isAuthenticated,
    getToken,
    getAdmin
};