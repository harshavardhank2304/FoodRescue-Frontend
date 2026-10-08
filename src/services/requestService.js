import api from './api';

export const requestService = {
  create: (data) => api.post('/requests', data),
  getMy: () => api.get('/requests/my'),
  getDonorRequests: () => api.get('/requests/donor'),
  getById: (id) => api.get(`/requests/${id}`),
  accept: (id) => api.put(`/requests/${id}/accept`),
  reject: (id) => api.put(`/requests/${id}/reject`),
};

export const volunteerService = {
  getTasks: () => api.get('/volunteers/tasks'),
  updateStatus: (id, status) => api.put(`/volunteers/tasks/${id}/status`, { status }),
  assignToSelf: (id) => api.put(`/volunteers/tasks/${id}/assign`),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getDonations: () => api.get('/admin/donations'),
  getRequests: () => api.get('/admin/requests'),
  getStatistics: () => api.get('/admin/statistics'),
};
