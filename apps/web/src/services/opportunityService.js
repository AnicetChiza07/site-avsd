import api from './api';

const getOpportunities = async () => {
    const response = await api.get('/opportunities');
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
        // 👉 CETTE LIGNE VA NOUS DIRE EXACTEMENT POURQUOI ÇA ÉCHOUE
        console.error("🚨 DÉTAIL DE L'ERREUR 400 :", error.response?.data);
        throw error;
    }
};

const updateOpportunity = async (id, data) => {
    const response = await api.put(`/opportunities/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
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