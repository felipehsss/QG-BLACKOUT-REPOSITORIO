// frontend-qgb/src/services/compraService.js
import { apiService } from './apiService';

const ENDPOINT = '/compras';

export const getCompras = async (token) => {
  return await apiService.get(ENDPOINT, token);
};

export const createCompra = async (data, token) => {
  // O backend espera: { fornecedor_id, loja_id, observacao, total, itens: [...] }
  return await apiService.post(ENDPOINT, data, token);
};

export const receberCompra = async (id, token) => {
  return await apiService.put(`${ENDPOINT}/${id}/receber`, {}, token);
};