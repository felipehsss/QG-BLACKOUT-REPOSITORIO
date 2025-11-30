import { apiService } from './apiService';

const ENDPOINT = '/estoque';

/**
 * Busca todo o estoque, com nomes de produtos e lojas
 */
export const getEstoqueCompleto = async (token) => {
  try {
    const res = await apiService.get(ENDPOINT, token);
    // O apiService já retorna o corpo da resposta. 
    // Se o backend retorna um array direto, 'res' é o array.
    return Array.isArray(res) ? res : (res.data || []);
  } catch (error) {
    console.error('Erro ao buscar estoque completo:', error);
    throw error;
  }
};

/**
 * Dá entrada em produtos (adiciona ou soma a quantidade)
 * @param {object} data - { produto_id, loja_id, quantidade }
 */
export const darEntradaEstoque = async (data, token) => {
  try {
    return await apiService.post(ENDPOINT, data, token);
  } catch (error) {
    console.error('Erro ao dar entrada no estoque:', error);
    throw error;
  }
};

/**
 * Busca a quantidade de um produto específico em uma loja específica
 */
export const getEstoquePorItemELoja = async (produtoId, lojaId, token) => {
  try {
    return await apiService.get(`${ENDPOINT}/produto/${produtoId}/loja/${lojaId}`, token);
  } catch (error) {
    console.error('Erro ao buscar estoque do item:', error);
    throw error;
  }
};

/**
 * Ajusta manualmente o estoque para um valor específico
 */
export const ajustarEstoque = async (estoqueId, data, token) => {
  try {
    return await apiService.put(`${ENDPOINT}/${estoqueId}`, data, token);
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    throw error;
  }
};