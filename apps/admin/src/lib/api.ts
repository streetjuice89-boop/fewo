import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = Cookies.get('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Dashboard API
export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getRecentBookings: (limit = 5) => api.get(`/dashboard/recent-bookings?limit=${limit}`),
  getChartData: (months = 6) => api.get(`/dashboard/chart-data?months=${months}`),
  getTopProperties: (limit = 5) => api.get(`/dashboard/top-properties?limit=${limit}`),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: unknown }>('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Properties API
export const propertiesApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/properties${query}`);
  },
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: unknown) => api.post('/properties', data),
  update: (id: string, data: unknown) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};

// Bookings API
export const bookingsApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/bookings${query}`);
  },
  getById: (id: string) => api.get(`/bookings/${id}`),
  update: (id: string, data: unknown) => api.put(`/bookings/${id}`, data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  getStatistics: () => api.get('/bookings/statistics'),
};

// Users API
export const usersApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/users${query}`);
  },
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  updateScore: (id: string, score: number) => api.put(`/users/${id}/score`, { score }),
  delete: (id: string) => api.delete(`/users/${id}`),
  getStatistics: () => api.get('/users/statistics'),
};

// Countries API
export const countriesApi = {
  getAll: () => api.get('/countries'),
  create: (data: unknown) => api.post('/countries', data),
  update: (id: string, data: unknown) => api.put(`/countries/${id}`, data),
  delete: (id: string) => api.delete(`/countries/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: string, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Chat API
export const chatApi = {
  getSessions: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/chat/sessions${query}`);
  },
  getActiveSessions: () => api.get('/chat/sessions/active'),
  getSession: (id: string) => api.get(`/chat/sessions/${id}`),
  closeSession: (id: string) => api.post(`/chat/sessions/${id}/close`, {}),
};

// Airbnb API
export const airbnbApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/airbnb${query}`);
  },
  import: (url: string, countryId: string) =>
    api.post(`/airbnb/import?countryId=${countryId}`, { url }),
  sync: (id: string) => api.post(`/airbnb/${id}/sync`, {}),
  delete: (id: string) => api.delete(`/airbnb/${id}`),
  getStatistics: () => api.get('/airbnb/statistics'),
};

// Logs API
export const logsApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/logs${query}`);
  },
  getActions: () => api.get('/logs/actions'),
  clear: (days = 30) => api.delete(`/logs/clear?days=${days}`),
};

