import api from './client';

export const getDashboardSummaryApi = async () => {
  const resp = await api.get('/dashboard/summary');
  return resp.data;
};

export const getDashboardTrendsApi = async (metric = 'water') => {
  const resp = await api.get(`/dashboard/trends?metric=${metric}`);
  return resp.data;
};
