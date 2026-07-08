// ===========================================
// SERVICE DASHBOARD
// ===========================================

import api from './api';

const getStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

const getRecentContacts = async () => {
    const response = await api.get('/dashboard/contacts/recent');
    return response.data;
};

const getRecentArticles = async () => {
    const response = await api.get('/dashboard/articles/recent');
    return response.data;
};

export default {
    getStats,
    getRecentContacts,
    getRecentArticles
};