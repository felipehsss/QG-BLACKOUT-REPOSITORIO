// frontend-qgb/src/services/estoqueService.js
import { apiService } from './apiService'; 

const API_URL = '/estoque';

/**
 * Busca todo o estoque.
 * @param {string} token - Token de autenticação
 */
export const getEstoqueCompleto = async (token) => { // [!code ++] Adicionado token
  try {
    // O apiService.get espera: (url, token)
    const response = await apiService.get(API_URL, token); // [!code ++] Passando token
    return response; 
  } catch (error) {
    console.error('Erro ao buscar estoque completo:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Dá entrada em produtos.
 * @param {object} data - { produto_id, loja_id, quantidade }
 * @param {string} token - Token de autenticação
 */
export const darEntradaEstoque = async (data, token) => { // [!code ++] Adicionado token
  try {
    // O apiService.post espera: (url, data, token)
    const response = await apiService.post(API_URL, data, token); // [!code ++] Passando token
    return response;
  } catch (error) {
    console.error('Erro ao dar entrada no estoque:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Busca estoque específico.
 * @param {number} produtoId 
 * @param {number} lojaId 
 * @param {string} token - Token de autenticação
 */
export const getEstoquePorItemELoja = async (produtoId, lojaId, token) => { // [!code ++] Adicionado token
  try {
    const response = await apiService.get(`${API_URL}/produto/${produtoId}/loja/${lojaId}`, token); // [!code ++] Passando token
    return response;
  } catch (error) {
    console.error('Erro ao buscar estoque do item:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Ajusta manualmente o estoque.
 * @param {number} estoqueId 
 * @param {object} data 
 * @param {string} token 
 */
export const ajustarEstoque = async (estoqueId, data, token) => { // [!code ++] Adicionado token
  try {
    // O apiService.put espera: (url, data, token)
    const response = await apiService.put(`${API_URL}/${estoqueId}`, data, token); // [!code ++] Passando token
    return response;
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error.response?.data || error.message);
    throw error;
  }
};