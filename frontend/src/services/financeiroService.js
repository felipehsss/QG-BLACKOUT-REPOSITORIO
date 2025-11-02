import { apiService } from './apiService';

const ENDPOINT = '/financeiro';

/**
 * Busca o relatório de fluxo de caixa.
 * (Rota: GET /fluxo-caixa)
 */
export const getFluxoCaixa = (token) => {
  return apiService.get(`${ENDPOINT}/fluxo-caixa`, token);
};

/**
 * Busca o relatório de despesas por categoria.
 * (Rota: GET /despesas-por-categoria)
 */
export const getDespesasPorCategoria = (token) => {
  return apiService.get(`${ENDPOINT}/despesas-por-categoria`, token);
};

/**
 * Busca o total de vendas dos últimos 30 dias.
 * (Rota: GET /total-vendas-ultimos-30-dias)
 */
export const getTotalVendasUltimos30Dias = (token) => {
  return apiService.get(`${ENDPOINT}/total-vendas-ultimos-30-dias`, token);
};
