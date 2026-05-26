// frontend/src/services/decompose-api.js
import { api } from './api.js';

export const decomposeApi = {
  preview: (taskId) =>
    api.post(`/tasks/${taskId}/decompose`, {}),

  confirm: (taskId, subtasks) =>
    api.post(`/tasks/${taskId}/decompose/confirm`, { subtasks }),

  getSubtasks: (taskId) =>
    api.get(`/tasks/${taskId}/subtasks`),
};