import axios from 'axios';

// Central API URL configuration
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');

// Ensure baseURL ends with /api cleanly without duplicate slashes
export const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests and normalize leading slashes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.url) {
    // Ensure relative endpoint starts with single slash
    config.url = config.url.replace(/^\/+/, '/');
  }
  return config;
});

// Automatically handle 401 Unauthorized (expired or invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or invalid token. Clearing credentials...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default API;
