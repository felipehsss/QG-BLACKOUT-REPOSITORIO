import { apiService } from './apiService';

const ENDPOINT = '/lojas';

export const readAll = (token) => {
  return apiService.get(ENDPOINT, token);
};

export const readById = (id, token) => {
  return apiService.get(`${ENDPOINT}/${id}`, token);
};

export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

export const update = (id, data, token) => {
  return apiService.put(`${ENDPOINT}/${id}`, data, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};
