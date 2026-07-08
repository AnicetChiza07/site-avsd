import api from './api';

const getGallery = async (category = null) => {
    const params = category && category !== 'all' ? { category } : {};
    const response = await api.get('/gallery', { params });
    return response.data;
};

const getCategories = async () => {
    const response = await api.get('/gallery/categories');
    return response.data;
};

export default {
    getGallery,
    getCategories
};