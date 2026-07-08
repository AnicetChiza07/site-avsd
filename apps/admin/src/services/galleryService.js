import api from './api';

const getGallery = async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/gallery', { params });
    return response.data;
};

const createGallery = async (data) => {
    const response = await api.post('/gallery', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const updateGallery = async (id, data) => {
    const response = await api.put(`/gallery/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const deleteGallery = async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
};

export default {
    getGallery,
    createGallery,
    updateGallery,
    deleteGallery
};