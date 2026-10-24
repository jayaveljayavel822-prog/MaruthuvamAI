import api from './client';

export const getMedicalRecordsApi = async (recordType = null, search = '') => {
  let url = '/medical-records';
  const params = [];
  if (recordType && recordType !== 'all') params.push(`record_type=${recordType}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length) url += `?${params.join('&')}`;

  const resp = await api.get(url);
  return resp.data;
};

export const createMedicalRecordApi = async (recordData) => {
  const resp = await api.post('/medical-records', recordData);
  return resp.data;
};

export const deleteMedicalRecordApi = async (recordId) => {
  await api.delete(`/medical-records/${recordId}`);
};

export const runOcrApi = async (formData) => {
  const resp = await api.post('/medical-records/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resp.data;
};

export const confirmOcrRecordApi = async (data) => {
  const resp = await api.post('/medical-records/ocr/confirm', data);
  return resp.data;
};

export const explainRecordApi = async (recordId) => {
  const resp = await api.post(`/medical-records/${recordId}/explain`);
  return resp.data;
};

export const generateUnifiedSummaryApi = async () => {
  const resp = await api.post('/medical-records/summary');
  return resp.data;
};
