import { apiService } from './apiService';

const ENDPOINT = '/itens-venda';

export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

/**
 * Busca itens pelo ID da Venda.
 * (Rota: GET /venda/:venda_id)
 */
export const readByVendaId = (vendaId, token) => {
  return apiService.get(`${ENDPOINT}/venda/${vendaId}`, token);
};
