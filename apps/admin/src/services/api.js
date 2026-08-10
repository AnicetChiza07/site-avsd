// ===========================================
// CONFIGURATION AXIOS & HELPERS D'IMAGES
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
    // On enlève '/api' et on s'assure qu'il n'y a pas de slash à la fin
    return apiUrl.replace('/api', '').replace(/\/$/, '');
};

// Fonction helper pour obtenir l'URL complète d'une image (CORRIGÉE ET BLINDÉE)
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // 1. CORRECTION : Réparer les URLs mal formatées venant de la DB (ex: "https//" au lieu de "https://")
    let cleanPath = String(imagePath)
        .replace('https//', 'https://')
        .replace('http//', 'http://');

    // 2. Si c'est déjà une URL complète (Cloudinary), on la retourne telle quelle
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath;
    }
    
    // 3. Si c'est un chemin local ou juste un nom de fichier, on construit l'URL proprement
    const baseUrl = getBaseUrl();
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `${baseUrl}${formattedPath}`;
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
            // On ne force le rechargement que si on n'est PAS déjà sur la page de login
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