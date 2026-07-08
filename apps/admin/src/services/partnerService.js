// ===========================================
// SERVICE PARTENAIRES
// ===========================================

import api from './api';

const getPartners = async () => {
    const response = await api.get('/partners');
    return response.data;
};

const createPartner = async (formData) => {
    const response = await api.post('/partners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const updatePartner = async (id, formData) => {
    const response = await api.put(`/partners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const deletePartner = async (id) => {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
};

export default {
    getPartners,
    createPartner,
    updatePartner,
    deletePartner
};