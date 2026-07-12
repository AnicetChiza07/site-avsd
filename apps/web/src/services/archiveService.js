// ===========================================
// SERVICE ARCHIVES
// ===========================================

import api from './api';

const getArchives = async (params = {}) => {
    const response = await api.get('/archives', { params });
    return response.data;
};

const getArchiveBySlug = async (slug) => {
    const response = await api.get(`/archives/${slug}`);
    return response.data;
};

export default {
    getArchives,
    getArchiveBySlug
};