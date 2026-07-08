import api from './api';

const getOpportunities = async () => {
    const response = await api.get('/opportunities');
    return response.data;
};

const getOpportunityById = async (id) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
};

const createOpportunity = async (data) => {
    const response = await api.post('/opportunities', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
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