import api from './api';

const getCategories = async () => {
    const response = await api.get('/gallery/categories');
    return response.data;
};

const createCategory = async (data) => {
    const response = await api.post('/gallery/categories', data);
    return response.data;
};

const updateCategory = async (id, data) => {
    const response = await api.put(`/gallery/categories/${id}`, data);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await api.delete(`/gallery/categories/${id}`);
    return response.data;
};

export default {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};