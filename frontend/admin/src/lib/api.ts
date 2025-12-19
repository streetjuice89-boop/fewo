import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  profile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/admin/dashboard/stats'),
  activity: () => api.get('/admin/dashboard/activity'),
  chart: (days = 30) => api.get('/admin/dashboard/chart', { params: { days } }),
  topProperties: () => api.get('/admin/dashboard/top-properties'),
};

// Properties
export const propertiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/properties', { params }),
  get: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post('/admin/properties', data),
  update: (id: string, data: any) => api.put(`/admin/properties/${id}`, data),
  delete: (id: string) => api.delete(`/admin/properties/${id}`),
};

// Countries
export const countriesApi = {
  list: () => api.get('/countries'),
  create: (data: any) => api.post('/admin/countries', data),
  update: (id: string, data: any) => api.put(`/admin/countries/${id}`, data),
  delete: (id: string) => api.delete(`/admin/countries/${id}`),
};

// Bookings
export const bookingsApi = {
  list: (params?: Record<string, unknown>) => api.get('/bookings', { params }),
  get: (id: string) => api.get(`/bookings/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/bookings/${id}/status`, { status }),
};

// Users
export const usersApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  get: (id: string) => api.get(`/admin/users/${id}`),
  update: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  updateScore: (id: string, score: number) =>
    api.patch(`/admin/users/${id}/score`, { score }),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
  statistics: () => api.get('/admin/users/statistics'),
};

// Chat
export const chatApi = {
  sessions: (params?: Record<string, unknown>) => api.get('/chat/sessions', { params }),
  messages: (sessionId: string) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    api.post(`/chat/sessions/${sessionId}/messages`, { content }),
  takeOver: (sessionId: string) => api.post(`/admin/chat/sessions/${sessionId}/takeover`),
  close: (sessionId: string) => api.post(`/chat/sessions/${sessionId}/close`),
};

// Airbnb
export const airbnbApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/airbnb', { params }),
  get: (id: string) => api.get(`/admin/airbnb/${id}`),
  grab: (url: string) => api.post('/admin/airbnb/grab', { url }),
  update: (id: string, data: {
    title?: string;
    description?: string;
    price?: number;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    amenities?: string[];
    images?: string[];
  }) => api.put(`/admin/airbnb/${id}`, data),
  sync: (id: string) => api.post(`/admin/airbnb/${id}/sync`),
  link: (id: string, propertyId: number) =>
    api.post(`/admin/airbnb/${id}/link`, { propertyId }),
  unlink: (id: string) => api.post(`/admin/airbnb/${id}/unlink`),
  createProperty: (id: string, countryId: number) =>
    api.post(`/admin/airbnb/${id}/create-property`, { countryId }),
  delete: (id: string) => api.delete(`/admin/airbnb/${id}`),
};

// Logs
export const logsApi = {
  list: (params?: Record<string, unknown>) => api.get('/admin/logs', { params }),
  statistics: () => api.get('/admin/logs/statistics'),
};

// Amenities
export const amenitiesApi = {
  list: (params?: { active_only?: boolean; category?: string }) =>
    api.get('/admin/amenities', { params }),
  categories: () => api.get('/admin/amenities/categories'),
  create: (data: { name: string; name_en?: string; icon?: string; category: string; active?: boolean; sort_order?: number }) =>
    api.post('/admin/amenities', data),
  bulkCreate: (amenities: Array<{ name: string; name_en?: string; icon?: string; category: string; active?: boolean; sort_order?: number }>) =>
    api.post('/admin/amenities/bulk', { amenities }),
  importFromListings: () => api.post('/admin/amenities/import-from-listings'),
  update: (id: number, data: { name?: string; name_en?: string; icon?: string; category?: string; active?: boolean; sort_order?: number }) =>
    api.put(`/admin/amenities/${id}`, data),
  toggleActive: (id: number) => api.patch(`/admin/amenities/${id}/toggle`),
  delete: (id: number) => api.delete(`/admin/amenities/${id}`),
};

export default api;

