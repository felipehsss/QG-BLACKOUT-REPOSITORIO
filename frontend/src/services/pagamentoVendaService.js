import { apiService } from './apiService';

const ENDPOINT = '/pagamentos-venda';

export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

/**
 * Busca pagamentos pelo ID da Venda.
 * (Rota: GET /venda/:venda_id)
 */
export const readByVendaId = (vendaId, token) => {
  return apiService.get(`${ENDPOINT}/venda/${vendaId}`, token);
};
