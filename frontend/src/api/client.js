import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('maruthuvam_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('maruthuvam_refresh_token');

      if (refreshToken) {
        try {
          const resp = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token: new_refresh } = resp.data;

          localStorage.setItem('maruthuvam_access_token', access_token);
          if (new_refresh) {
            localStorage.setItem('maruthuvam_refresh_token', new_refresh);
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('maruthuvam_access_token');
          localStorage.removeItem('maruthuvam_refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('maruthuvam_access_token');
        localStorage.removeItem('maruthuvam_refresh_token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
