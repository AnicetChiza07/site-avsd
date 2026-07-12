// ===========================================
// SERVICE STATISTIQUES
// ===========================================

import api from './api';

const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};

const getMonthlyContacts = async () => {
    const response = await api.get('/stats/contacts/monthly');
    return response.data;
};

const getArticlesByCategory = async () => {
    const response = await api.get('/stats/articles/by-category');
    return response.data;
};

const getArchivesByYear = async () => {
    const response = await api.get('/stats/archives/by-year');
    return response.data;
};

export default {
    getStats,
    getMonthlyContacts,
    getArticlesByCategory,
    getArchivesByYear
};