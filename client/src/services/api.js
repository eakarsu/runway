import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Collection endpoints return paginated objects; keep malformed responses out of card grids.
export function rowsFromResponse(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['data', 'rows', 'items']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

export default api;
