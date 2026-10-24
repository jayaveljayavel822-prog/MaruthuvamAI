import api from './client';

export const previewFhirBundleApi = async () => {
  const resp = await api.get('/fhir/preview');
  return resp.data;
};

export const linkAbhaSandboxApi = async (abhaNumber) => {
  const resp = await api.post(`/fhir/abha/link?abha_number=${encodeURIComponent(abhaNumber)}`);
  return resp.data;
};

export const importAbdmRecordsApi = async () => {
  const resp = await api.post('/fhir/abha/import');
  return resp.data;
};

export const unlinkAbhaApi = async () => {
  const resp = await api.post('/fhir/abha/unlink');
  return resp.data;
};
