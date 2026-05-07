import api from './api.js';

const statsService = {
  getDashboardStats: () => api.get('/stats/dashboard'),
};

export default statsService;

