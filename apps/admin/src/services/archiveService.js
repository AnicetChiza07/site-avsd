import api from './api';

const archiveService = {
    // Obtenir toutes les archives
    getArchives: (params = {}) => {
        return api.get('/archives', { params });
    },

    // Obtenir une archive par slug
    getArchiveBySlug: (slug) => {
        return api.get(`/archives/${slug}`);
    },

    // Créer une archive
    createArchive: (formData) => {
        return api.post('/archives', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Modifier une archive
    updateArchive: (id, formData) => {
        return api.put(`/archives/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Supprimer une archive
    deleteArchive: (id) => {
        return api.delete(`/archives/${id}`);
    }
};

export default archiveService;