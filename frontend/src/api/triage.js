import api from './client';

export const getTriageRulesApi = async () => {
  const resp = await api.get('/triage/rules');
  return resp.data;
};

export const assessTriageApi = async (data) => {
  const resp = await api.post('/triage/assess', data);
  return resp.data;
};
