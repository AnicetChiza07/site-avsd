import api from './api';

const getPartners = async () => {
    const response = await api.get('/partners');
    return response.data;
};

export default {
    getPartners
};