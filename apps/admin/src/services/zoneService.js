import api from './api';

const getZones = async () => {
    const response = await api.get('/zones');
    return response.data;
};

const createZone = async (formData) => {
    const response = await api.post('/zones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const updateZone = async (id, formData) => {
    const response = await api.put(`/zones/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const deleteZone = async (id) => {
    const response = await api.delete(`/zones/${id}`);
    return response.data;
};

export default { getZones, createZone, updateZone, deleteZone };