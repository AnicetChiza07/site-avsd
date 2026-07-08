// ===========================================
// SERVICE ARTICLES
// ===========================================

import api from './api';

const getArticles = async (page = 1, limit = 10) => {
    const response = await api.get(`/articles?page=${page}&limit=${limit}`);
    return response.data;
};

const getArticleById = async (id) => {
    const response = await api.get(`/articles/id/${id}`);
    return response.data;
};

const getArticleBySlug = async (slug) => {
    const response = await api.get(`/articles/${slug}`);
    return response.data;
};

const createArticle = async (formData) => {
    const response = await api.post('/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const updateArticle = async (id, formData) => {
    const response = await api.put(`/articles/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const deleteArticle = async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
};

export default {
    getArticles,
    getArticleById,
    getArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle
};