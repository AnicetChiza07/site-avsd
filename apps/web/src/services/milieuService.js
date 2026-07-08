import api from './api';

const getMilieux = async () => {
    const response = await api.get('/milieux');
    return response.data;
};

export default {
    getMilieux
};