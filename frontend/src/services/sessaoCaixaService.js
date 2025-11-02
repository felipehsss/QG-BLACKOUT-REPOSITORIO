import { apiService } from './apiService';

const ENDPOINT = '/sessoes-caixa';

export const readAll = (token) => {
  return apiService.get(ENDPOINT, token);
};

export const readById = (id, token) => {
  return apiService.get(`${ENDPOINT}/${id}`, token);
};

/**
 * Abre uma nova sessão de caixa.
 * (Rota: POST /abrir)
 */
export const abrir = (data, token) => {
  return apiService.post(`${ENDPOINT}/abrir`, data, token);
};

/**
 * Fecha uma sessão de caixa.
 * (Rota: PUT /fechar/:id)
 */
export const fechar = (id, data, token) => {
  return apiService.put(`${ENDPOINT}/fechar/${id}`, data, token);
};

/**
 * Verifica se há uma sessão de caixa aberta.
 * (Rota: GET /status)
 */
export const getStatus = (token) => {
  return apiService.get(`${ENDPOINT}/status`, token);
};
