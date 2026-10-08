import api from './api';

export const donationService = {
  getAll: (page = 0, size = 10, sortBy = 'createdAt', direction = 'desc') =>
    api.get(`/donations?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),

  getAvailable: (page = 0, size = 10, sortBy = 'createdAt', direction = 'desc') =>
    api.get(`/donations/available?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),

  getMy: () => api.get('/donations/my'),

  getById: (id) => api.get(`/donations/${id}`),

  create: (data) => api.post('/donations', data),

  update: (id, data) => api.put(`/donations/${id}`, data),

  delete: (id) => api.delete(`/donations/${id}`),
};
