import { apiService } from './apiService';

const ENDPOINT = '/pagamentos-conta';

export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

/**
 * Busca pagamentos pelo ID da Conta.
 * (Rota: GET /conta/:conta_id)
 */
export const readByContaId = (contaId, token) => {
  return apiService.get(`${ENDPOINT}/conta/${contaId}`, token);
};
