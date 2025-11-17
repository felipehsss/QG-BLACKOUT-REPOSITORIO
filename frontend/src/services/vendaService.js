import { apiService } from './apiService';

const ENDPOINT = '/vendas';

/**
 * Lista todas as vendas
 * (GET /vendas)
 */
export const readAll = (token) => {
  return apiService.get(ENDPOINT, token);
};

/**
 * Busca uma venda pelo ID
 * (GET /vendas/:id)
 */
export const readById = (id, token) => {
  return apiService.get(`${ENDPOINT}/${id}`, token);
};

/**
 * Cria uma nova venda completa
 * (POST /vendas)
 */
export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

/**
 * Atualiza uma venda (ex: cancelar)
 * (PUT /vendas/:id)
 */
export const update = (id, data, token) => {
  return apiService.put(`${ENDPOINT}/${id}`, data, token);
};

/**
 * Remove uma venda
 * (DELETE /vendas/:id)
 */
export const remove = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};

/**
 * Gera o relatório de vendas
 * (GET /vendas/relatorio)
 */
export const getRelatorioVendas = (token) => {
  return apiService.get(`${ENDPOINT}/relatorio`, token);
};
