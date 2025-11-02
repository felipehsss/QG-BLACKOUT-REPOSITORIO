import { apiService } from './apiService';

const ENDPOINT = '/perfis';

export const readAll = (token) => {
  return apiService.get(ENDPOINT, token);
};
