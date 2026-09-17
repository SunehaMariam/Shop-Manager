import axios from 'axios';

const api = axios.create({
  baseURL: 'https://shop-manager-six-lemon.vercel.app/api'
});

// Har request ke sath token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expire ho to login par wapas
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getError = (err) => err?.response?.data?.message || err.message || 'Something went wrong';

export default api;
