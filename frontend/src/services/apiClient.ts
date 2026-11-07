/**
 * Centralized API Client for IntelliDesk Platform.
 * Supports switching between Mock Mode (default for standalone frontend)
 * and real FastAPI backend via VITE_API_BASE_URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to true

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Simulated network latency for realistic feel in mock mode
export const simulateLatency = (ms = 250): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('intellidesk_auth_token');
};

const unwrapResponse = <T>(json: any): T => {
  if (json && typeof json === 'object') {
    if ('token' in json && json.token && typeof json.token === 'string') {
      localStorage.setItem('intellidesk_auth_token', json.token);
    }
    if ('data' in json && json.data !== undefined) {
      return json.data as T;
    }
    if ('user' in json && json.user !== undefined) {
      return json.user as T;
    }
  }
  return json as T;
};

export const apiClient = {
  baseUrl: API_BASE_URL,
  isMock: IS_MOCK_MODE,

  async get<T>(endpoint: string, mockFallback?: () => T | Promise<T>): Promise<T> {
    if (IS_MOCK_MODE && mockFallback) {
      await simulateLatency();
      return mockFallback();
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new ApiError(`Request failed with status ${res.status}`, res.status);
      }
      const json = await res.json();
      return unwrapResponse<T>(json);
    } catch (err) {
      if (mockFallback) {
        console.warn(`[IntelliDesk API] Endpoint ${endpoint} unreachable. Using mock data fallback.`);
        return mockFallback();
      }
      throw err;
    }
  },

  async post<T>(endpoint: string, body?: any, mockFallback?: (payload: any) => T | Promise<T>): Promise<T> {
    if (IS_MOCK_MODE && mockFallback) {
      await simulateLatency();
      return mockFallback(body);
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        throw new ApiError(`POST failed with status ${res.status}`, res.status);
      }
      const json = await res.json();
      return unwrapResponse<T>(json);
    } catch (err) {
      if (mockFallback) {
        console.warn(`[IntelliDesk API] POST ${endpoint} unreachable. Using mock fallback.`);
        return mockFallback(body);
      }
      throw err;
    }
  },

  async patch<T>(endpoint: string, body?: any, mockFallback?: (payload: any) => T | Promise<T>): Promise<T> {
    if (IS_MOCK_MODE && mockFallback) {
      await simulateLatency();
      return mockFallback(body);
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        throw new ApiError(`PATCH failed with status ${res.status}`, res.status);
      }
      const json = await res.json();
      return unwrapResponse<T>(json);
    } catch (err) {
      if (mockFallback) {
        return mockFallback(body);
      }
      throw err;
    }
  },
};
