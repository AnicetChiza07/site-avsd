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
export const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
};

// Fonction helper pour obtenir l'URL complète d'une image
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    return `${getBaseUrl()}${imagePath}`;
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

// Intercepteur pour gérer les erreurs 401 (CORRIGÉ)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // CORRECTION : On ne force le rechargement que si on n'est PAS déjà sur la page de login
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;