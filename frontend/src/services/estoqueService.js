// frontend/src/services/estoqueService.js
import apiService from './apiService'; // (Caminho baseado nos seus outros services)

const API_URL = '/estoque';

/**
 * Busca todo o estoque, com nomes de produtos e lojas
 */
export const getEstoqueCompleto = async () => {
  try {
    const response = await apiService.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estoque completo:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Dá entrada em produtos (adiciona ou soma a quantidade)
 * @param {object} data - { produto_id, loja_id, quantidade }
 */
export const darEntradaEstoque = async (data) => {
  try {
    const response = await apiService.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao dar entrada no estoque:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Busca a quantidade de um produto específico em uma loja específica
 * @param {number} produtoId 
 * @param {number} lojaId 
 */
export const getEstoquePorItemELoja = async (produtoId, lojaId) => {
  try {
    const response = await apiService.get(`${API_URL}/produto/${produtoId}/loja/${lojaId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estoque do item:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Ajusta manualmente o estoque para um valor específico
 * @param {number} estoqueId - ID da *linha* de estoque (não do produto)
 * @param {object} data - { quantidade }
 */
export const ajustarEstoque = async (estoqueId, data) => {
  try {
    const response = await apiService.put(`${API_URL}/${estoqueId}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error.response?.data || error.message);
    throw error;
  }
};