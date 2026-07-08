// ===========================================
// SERVICE CONTACTS
// ===========================================

import api from './api';

const getContacts = async (page = 1, limit = 10) => {
    const response = await api.get(`/contacts?page=${page}&limit=${limit}`);
    return response.data;
};

const getContactById = async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
};

const markAsRead = async (id) => {
    const response = await api.patch(`/contacts/${id}/read`);
    return response.data;
};

const markAsUnread = async (id) => {
    const response = await api.patch(`/contacts/${id}/unread`);
    return response.data;
};

const deleteContact = async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
};

export default {
    getContacts,
    getContactById,
    markAsRead,
    markAsUnread,
    deleteContact
};