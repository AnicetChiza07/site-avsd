// ===========================================
// SERVICE OPPORTUNITÉS
// ===========================================

import api from './api';

const getOpportunities = async (page = 1, limit = 10) => {
    const response = await api.get(`/opportunities?page=${page}&limit=${limit}`);
    return response.data;
};

const getOpportunityById = async (id) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
};

const createOpportunity = async (formData) => {
    const response = await api.post('/opportunities', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const updateOpportunity = async (id, formData) => {
    const response = await api.put(`/opportunities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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