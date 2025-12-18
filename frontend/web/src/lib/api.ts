import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: {
    username: string;
    email?: string;
    firstName: string;
    lastName: string;
    password: string;
    password_confirmation: string;
  }) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Properties API
export const propertiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/properties', { params }),
  featured: (limit = 6) => api.get('/properties/featured', { params: { limit } }),
  get: (id: string) => api.get(`/properties/${id}`),
  checkAvailability: (id: string, checkIn: string, checkOut: string) =>
    api.get(`/properties/${id}/availability`, { params: { checkIn, checkOut } }),
};

// Countries API
export const countriesApi = {
  list: () => api.get('/countries'),
  get: (id: string) => api.get(`/countries/${id}`),
};

// Bookings API
export const bookingsApi = {
  list: (params?: Record<string, unknown>) => api.get('/bookings', { params }),
  get: (id: string) => api.get(`/bookings/${id}`),
  create: (data: {
    propertyId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes?: string;
  }) => api.post('/bookings', data),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
};

// Chat API
export const chatApi = {
  sessions: () => api.get('/chat/sessions'),
  createSession: () => api.post('/chat/sessions'),
  messages: (sessionId: string) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    api.post(`/chat/sessions/${sessionId}/messages`, { content }),
  closeSession: (sessionId: string) => api.post(`/chat/sessions/${sessionId}/close`),
};

export default api;

