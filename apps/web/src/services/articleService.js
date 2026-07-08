import api from './api';

const getArticles = async (limit = 6) => {
    const response = await api.get(`/articles?limit=${limit}`);
    return response.data;
};

const getArticleBySlug = async (slug) => {
    const response = await api.get(`/articles/slug/${slug}`);
    return response.data;
};

export default {
    getArticles,
    getArticleBySlug
};