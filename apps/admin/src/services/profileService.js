import api from './api';

const getProfile = async () => {
    const response = await api.get('/profile/me');
    return response.data;
};

const updateProfile = async (data) => {
    const response = await api.put('/profile/me', data);
    return response.data;
};

const changePassword = async (passwords) => {
    const response = await api.put('/profile/change-password', passwords);
    return response.data;
};

const uploadAvatar = async (formData) => {
    const response = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const removeAvatar = async () => {
    const response = await api.delete('/profile/avatar');
    return response.data;
};

export default {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    removeAvatar
};