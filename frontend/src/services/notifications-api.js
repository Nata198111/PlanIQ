import { api } from './api.js';
 
export const notificationsApi = {
  getAll:   ()   => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAll:  ()   => api.patch('/notifications/read-all', {}),
  delete:   (id) => api.delete(`/notifications/${id}`),
};