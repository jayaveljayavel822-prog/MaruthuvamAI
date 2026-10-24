import api from './client';

export const getHealthLogsApi = async (limit = 30) => {
  const resp = await api.get(`/health-logs?limit=${limit}`);
  return resp.data;
};

export const saveHealthLogApi = async (logData) => {
  const resp = await api.post('/health-logs', logData);
  return resp.data;
};

export const updateHealthLogApi = async (logId, updateData) => {
  const resp = await api.patch(`/health-logs/${logId}`, updateData);
  return resp.data;
};

export const deleteHealthLogApi = async (logId) => {
  await api.delete(`/health-logs/${logId}`);
};
