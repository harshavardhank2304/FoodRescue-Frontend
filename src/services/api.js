import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor – attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401/403, basic retry
let retryCount = 0;
const MAX_RETRIES = 2;

api.interceptors.response.use(
  (response) => {
    retryCount = 0;
    return response;
  },
  async (error) => {
    const { response, config } = error;

    if (!response) {
      // Network error – retry up to MAX_RETRIES times
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise((res) => setTimeout(res, 1000 * retryCount));
        return api(config);
      }
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    retryCount = 0;
    return Promise.reject(error);
  }
);

export default api;
