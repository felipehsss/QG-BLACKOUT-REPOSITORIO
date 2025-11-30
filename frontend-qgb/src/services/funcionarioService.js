import { apiService } from './apiService';

const ENDPOINT = '/funcionarios';

export const readAll = (token) => apiService.get(ENDPOINT, token);
export const readById = (id, token) => apiService.get(`${ENDPOINT}/${id}`, token);

export const create = (data, token) => {
  // Se for FormData, passa direto
  if (data instanceof FormData) {
    return apiService.post(ENDPOINT, data, token);
  }
  return apiService.post(ENDPOINT, data, token);
};

export const update = (id, data, token) => {
  // Se for FormData, passa direto
  if (data instanceof FormData) {
    return apiService.put(`${ENDPOINT}/${id}`, data, token);
  }
  return apiService.put(`${ENDPOINT}/${id}`, data, token);
};

export const deleteRecord = (id, token) => apiService.delete(`${ENDPOINT}/${id}`, token);