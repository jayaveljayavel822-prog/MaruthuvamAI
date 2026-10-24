import api from './client';

export const getAppointmentsApi = async () => {
  const resp = await api.get('/appointments');
  return resp.data;
};

export const createAppointmentApi = async (data) => {
  const resp = await api.post('/appointments', data);
  return resp.data;
};

export const deleteAppointmentApi = async (id) => {
  await api.delete(`/appointments/${id}`);
};
