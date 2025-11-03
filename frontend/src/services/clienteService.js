import { apiService } from './apiService';

// O endpoint base para clientes, conforme backend/routes/clienteRoutes.js
const ENDPOINT = '/clientes';

/**
 * Busca todos os clientes.
 * @param {string} token - O token JWT para autorização.
 * @returns {Promise<Array>} - Uma promessa que resolve para um array de clientes.
 */
export const readAll = (token) => {
  return apiService.get(ENDPOINT, token);
};

/**
 * Busca um cliente específico pelo ID.
 * @param {number|string} id - O ID do cliente.
 * @param {string} token - O token JWT para autorização.
 * @returns {Promise<Object>} - Uma promessa que resolve para o objeto do cliente.
 */
export const readById = (id, token) => {
  return apiService.get(`${ENDPOINT}/${id}`, token);
};

/**
 * Cria um novo cliente.
 * @param {Object} data - Os dados do novo cliente (nome, email, telefone, etc.).
 * @param {string} token - O token JWT para autorização.
 * @returns {Promise<Object>} - Uma promessa que resolve para o novo cliente criado.
 */
export const create = (data, token) => {
  return apiService.post(ENDPOINT, data, token);
};

/**
 * Atualiza um cliente existente.
 * @param {number|string} id - O ID do cliente a ser atualizado.
 * @param {Object} data - Os novos dados do cliente.
 * @param {string} token - O token JWT para autorização.
 * @returns {Promise<Object>} - Uma promessa que resolve para o cliente atualizado.
 */
export const update = (id, data, token) => {
  return apiService.put(`${ENDPOINT}/${id}`, data, token);
};

/**
 * Deleta um cliente.
 * @param {number|string} id - O ID do cliente a ser deletado.
 * @param {string} token - O token JWT para autorização.
 * @returns {Promise<Object>} - Uma promessa que resolve para a mensagem de sucesso.
 */
export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};
