import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const assignmentApi = {
  list: () => api.get('/assignments'),
  get: (id: string) => api.get(`/assignments/${id}`),
  create: (data: any) => api.post('/assignments', data),
  submit: (id: string, data: any) => api.post(`/assignments/${id}/submit`, data),
};

export const examApi = {
  list: () => api.get('/exams'),
  get: (id: string) => api.get(`/exams/${id}`),
  create: (data: any) => api.post('/exams', data),
  submit: (id: string, data: any) => api.post(`/exams/${id}/submit`, data),
};

export default api;
