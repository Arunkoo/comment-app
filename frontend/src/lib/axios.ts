import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Let Vite proxy handle forwarding to http://app:3000
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add token automatically if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
