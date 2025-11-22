import { apiService } from './apiService';

/**
 * Busca os dados do fluxo de caixa para um período específico.
 * @param {string} dataInicio - A data de início no formato YYYY-MM-DD.
 * @param {string} dataFim - A data de fim no formato YYYY-MM-DD.
 * @param {string} token - O token de autenticação do usuário.
 * @returns {Promise<object>} Os dados do fluxo de caixa.
 */
export const getFluxoCaixa = async (dataInicio, dataFim, token) => {
  try {
    const endpoint = `/financeiro/fluxo-caixa?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    const response = await apiService.get(endpoint, token);
    return response || { transacoes: [], saldoInicial: 0, totalEntradas: 0, totalSaidas: 0, saldoFinal: 0 };
  } catch (error) {
    console.error('Falha ao buscar fluxo de caixa:', error);
    throw error;
  }
};

/**
 * Busca todos os lançamentos financeiros (movimentações).
 * @param {string} token - O token de autenticação do usuário.
 * @returns {Promise<Array>} Uma lista de lançamentos.
 */
export const readAll = async (token) => {
  try {
    // Esta rota precisa ser criada no backend. Ex: /api/financeiro/lancamentos
    const response = await apiService.get('/financeiro/lancamentos', token);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Falha ao buscar todos os lançamentos financeiros:', error);
    // Retorna um array vazio em caso de erro para não quebrar a UI
    return [];
  }
};