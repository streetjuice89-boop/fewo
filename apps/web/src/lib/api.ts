import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  authenticated?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(authenticated: boolean): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authenticated) {
      const token = Cookies.get('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { authenticated = false, ...fetchOptions } = options;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(authenticated),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, authenticated = false): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET', authenticated });
  }

  async post<T>(endpoint: string, data: unknown, authenticated = false): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated,
    });
  }

  async put<T>(endpoint: string, data: unknown, authenticated = false): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      authenticated,
    });
  }

  async delete<T>(endpoint: string, authenticated = false): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE', authenticated });
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: unknown }>('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post<{ accessToken: string; user: unknown }>('/auth/register', data),

  getProfile: () => api.get('/auth/profile', true),
};

// Properties API
export const propertiesApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return api.get(`/properties${query}`);
  },

  getFeatured: (limit = 6) => api.get(`/properties/featured?limit=${limit}`),

  getById: (id: string) => api.get(`/properties/${id}`),

  checkAvailability: (id: string, checkIn: string, checkOut: string) =>
    api.get(`/properties/${id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`),
};

// Bookings API
export const bookingsApi = {
  create: (data: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes?: string;
  }) => api.post('/bookings', data, true),

  getMyBookings: (page = 1, limit = 10) =>
    api.get(`/bookings/my-bookings?page=${page}&limit=${limit}`, true),

  getById: (id: string) => api.get(`/bookings/${id}`, true),

  cancel: (id: string) => api.put(`/bookings/${id}`, { status: 'cancelled' }, true),
};

// Countries API
export const countriesApi = {
  getAll: () => api.get('/countries'),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

