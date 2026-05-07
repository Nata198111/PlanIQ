import { api } from './api.js';

export const taskApi = {

  getAll: () => api.get('/tasks'),

  create: (data) => api.post('/tasks', data),

  update: (id, data) => api.patch(`/tasks/${id}`, data),

  delete: (id) => api.delete(`/tasks/${id}`),
};