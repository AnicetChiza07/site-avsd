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
// Détecte automatiquement si c'est une URL Cloudinary ou un chemin local
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // Si c'est déjà une URL complète (Cloudinary ou autre)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Sinon, c'est un chemin local, on ajoute l'URL de base
    return `${getBaseUrl()}${imagePath}`;
};

export default api;