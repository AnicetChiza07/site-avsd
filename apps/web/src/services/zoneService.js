import api from './api';

const getZones = async () => {
    const response = await api.get('/zones');
    return response.data;
};

export default {
    getZones
};