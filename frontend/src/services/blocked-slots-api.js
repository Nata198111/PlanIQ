import { api } from './api.js';
 
export const blockedSlotsApi = {
  getAll: () => api.get('/blocked-slots'),

  create: (data) => api.post('/blocked-slots', data),
 
  delete: (id) => api.delete(`/blocked-slots/${id}`),
};
 