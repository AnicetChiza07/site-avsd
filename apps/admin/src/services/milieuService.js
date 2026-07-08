// ===========================================
// SERVICE MILIEUX D'INTERVENTION
// ===========================================

import api from './api';

const getMilieux = async () => {
    const response = await api.get('/milieux');
    return response.data;
};

const createMilieu = async (data) => {
    const response = await api.post('/milieux', data);
    return response.data;
};

const updateMilieu = async (id, data) => {
    const response = await api.put(`/milieux/${id}`, data);
    return response.data;
};

const deleteMilieu = async (id) => {
    const response = await api.delete(`/milieux/${id}`);
    return response.data;
};

export default {
    getMilieux,
    createMilieu,
    updateMilieu,
    deleteMilieu
};