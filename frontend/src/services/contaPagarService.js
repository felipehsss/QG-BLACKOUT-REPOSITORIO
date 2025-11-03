import { apiService } from './apiService';

const ENDPOINT = '/contas_a_pagar';

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

/**
 * Busca contas a pagar por ID do fornecedor.
 * (Rota: GET /fornecedor/:id)
 */
export const readByFornecedorId = (fornecedorId, token) => {
  return apiService.get(`${ENDPOINT}/fornecedor/${fornecedorId}`, token);
};
