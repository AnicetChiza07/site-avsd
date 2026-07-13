// ===========================================
// SERVICE OPPORTUNITÉS
// ===========================================

import api from './api';

const getOpportunities = async (page = 1, limit = 100) => {
    const response = await api.get(`/opportunities?page=${page}&limit=${limit}`);
    return response.data;
};

const getOpportunityById = async (id) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
};

const createOpportunity = async (formData) => {
    try {
        const response = await api.post('/opportunities', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        // 👉 CETTE LIGNE VA AFFICHER LE MESSAGE EXACT DU SERVEUR EN ROUGE DANS LA CONSOLE
        console.error("🚨 ERREUR BACKEND DÉTAILLÉE (Create) :", error.response?.data);
        throw error;
    }
};

const updateOpportunity = async (id, formData) => {
    try {
        const response = await api.put(`/opportunities/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        // 👉 CETTE LIGNE VA AFFICHER LE MESSAGE EXACT DU SERVEUR EN ROUGE DANS LA CONSOLE
        console.error("🚨 ERREUR BACKEND DÉTAILLÉE (Update) :", error.response?.data);
        throw error;
    }
};

const deleteOpportunity = async (id) => {
    const response = await api.delete(`/opportunities/${id}`);
    return response.data;
};

export default {
    getOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
};