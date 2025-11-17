// frontend/src/services/produtoFornecedorService.js
import { apiService } from "./apiService";

// Endpoint base que definimos nas rotas do backend
const API_URL = '/produtos-fornecedores';

/**
 * Linka um produto a um fornecedor e define/atualiza o preço de custo
 * @param {object} data - { produto_id, fornecedor_id, preco_custo, sku_fornecedor? }
 */
export const linkarFornecedor = async (data) => {
  try {
    const response = await apiService.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao linkar fornecedor ao produto:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deslinka um produto de um fornecedor
 * @param {number} produtoId
 * @param {number} fornecedorId
 */
export const deslinkarFornecedor = async (produtoId, fornecedorId) => {
  try {
    const response = await apiService.delete(`${API_URL}/${produtoId}/${fornecedorId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deslinkar fornecedor do produto:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Lista todos os fornecedores (com seus custos) de um produto específico
 * @param {number} produtoId
 */
export const getFornecedoresDoProduto = async (produtoId) => {
  try {
    const response = await apiService.get(`${API_URL}/produto/${produtoId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar fornecedores do produto ${produtoId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Lista todos os produtos (com seus custos) de um fornecedor específico
 * @param {number} fornecedorId
 */
export const getProdutosDoFornecedor = async (fornecedorId) => {
  try {
    const response = await apiService.get(`${API_URL}/fornecedor/${fornecedorId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produtos do fornecedor ${fornecedorId}:`, error.response?.data || error.message);
    throw error;
  }
};