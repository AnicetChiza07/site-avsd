// ===========================================
// CONFIGURATION AXIOS
// ===========================================

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Fonction helper pour obtenir l'URL de base (sans /api)
// Utilisée pour construire les URLs complètes des images uploadées
export const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
};

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalide ou expiré
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;