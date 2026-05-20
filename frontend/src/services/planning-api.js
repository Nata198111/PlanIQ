import { api } from './api.js';

export const planningApi = {
  schedule: (daysAhead = 7) =>
    api.post('/planning/schedule', { days_ahead: daysAhead }),

  reschedule: (taskId) =>
    api.post(`/planning/reschedule/${taskId}`, {}),
};