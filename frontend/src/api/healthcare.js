import api from './client';

export const searchHealthcarePlacesApi = async (category = 'hospital', lat = null, lon = null, radius = 5000) => {
  let url = `/healthcare/search?category=${category}&radius=${radius}`;
  if (lat !== null && lon !== null) {
    url += `&latitude=${lat}&longitude=${lon}`;
  }
  const resp = await api.get(url);
  return resp.data;
};

export const getSpecialtiesApi = async () => {
  const resp = await api.get('/healthcare/specialties');
  return resp.data;
};

export const searchMedicineAvailabilityApi = async (medicineName) => {
  const resp = await api.get(`/healthcare/medicine-search?medicine_name=${encodeURIComponent(medicineName)}`);
  return resp.data;
};
