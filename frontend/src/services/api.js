import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const taskAPI = {
  // Get all tasks with optional filters
  getTasks: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status &&  filters.status !== 'all') params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    
    return api.get(`/tasks?${params.toString()}`);
  },

  // Get single task
  getTask: (id) => api.get(`/tasks/${id}`),

  // Create new task
  createTask: (taskData) => api.post('/tasks', taskData),

  // Update task
  updateTask: (id, updates) => api.put(`/tasks/${id}`, updates),

  // Toggle task completion
  toggleComplete: (id) => api.patch(`/tasks/${id}/complete`),

  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Export tasks
  exportTasks: (format = 'json') => {
    return api.get(`/tasks/export?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });
  },
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
};

export default api;
