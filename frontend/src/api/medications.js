import api from './client';

export const getRemindersApi = async () => {
  const resp = await api.get('/medications/reminders');
  return resp.data;
};

export const createReminderApi = async (data) => {
  const resp = await api.post('/medications/reminders', data);
  return resp.data;
};

export const deleteReminderApi = async (id) => {
  await api.delete(`/medications/reminders/${id}`);
};

export const logReminderTakenApi = async (id, status = 'taken') => {
  const resp = await api.post(`/medications/reminders/${id}/log?status_action=${status}`);
  return resp.data;
};
