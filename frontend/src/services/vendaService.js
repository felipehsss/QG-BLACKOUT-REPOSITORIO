import { apiService } from './apiService';

const ENDPOINT = '/vendas';

export const readAll = (token) => {
  return apiService.get(ENDPOINT, token);
};

export const readById = (id, token) => {
  return apiService.get(`${ENDPOINT}/${id}`, token);
};

export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

/**
 * Cancela uma venda.
 * (Rota: PUT /cancelar/:id)
 */
export const cancelar = (id, token) => {
  return apiService.put(`${ENDPOINT}/cancelar/${id}`, {}, token);
};

/**
 * Busca o relatório de vendas.
 * (Rota: GET /relatorio/vendas)
 */
export const getRelatorioVendas = (token) => {
  return apiService.get(`${ENDPOINT}/relatorio/vendas`, token);
};
