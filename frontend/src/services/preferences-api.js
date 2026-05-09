// frontend/src/services/preferences-api.js
import { api } from './api.js';
 
export const preferencesApi = {
  get:    ()     => api.get('/preferences'),
  patch:  (data) => api.patch('/preferences', data),
  put:    (data) => api.put('/preferences', data),
};
 