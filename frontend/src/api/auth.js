import api from './client';

export const loginApi = async (username, password) => {
  const resp = await api.post('/auth/login', { username, password });
  return resp.data;
};

export const registerApi = async (userData) => {
  const resp = await api.post('/auth/register', userData);
  return resp.data;
};

export const logoutApi = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('maruthuvam_access_token');
    localStorage.removeItem('maruthuvam_refresh_token');
  }
};

export const getMeApi = async () => {
  const resp = await api.get('/users/me');
  return resp.data;
};

export const updateMeApi = async (data) => {
  const resp = await api.patch('/users/me', data);
  return resp.data;
};
