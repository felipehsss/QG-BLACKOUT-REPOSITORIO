import { apiService } from './apiService';

// CORREÇÃO: Adicionado o prefixo /api que é esperado pelo backend/index.js
const ENDPOINT = '/auth';

/**
 * Realiza o login do usuário.
 * @param {object} credentials - Objeto com email e senha.
 * @param {string} credentials.email - Email do usuário.
 * @param {string} credentials.senha - Senha do usuário.
 * @returns {Promise<any>} Resposta da API com token e usuário.
 */
export const loginService = (credentials) => {
  try {
    // Esta rota não requer token
    // Envia o objeto 'credentials' diretamente, que contém { email, senha }
    return apiService.post(`${ENDPOINT}/login`, credentials);
  } catch (error) {
    console.error('Erro no serviço de login:', error);
    throw error;
  }
};

/**
 * Realiza o logout (apenas notifica o backend, se necessário).
 * @returns {Promise<any>}
 */
export const logoutService = () => {
  try {
    // Esta rota não requer token
    return apiService.post(`${ENDPOINT}/logout`, {});
  } catch (error) {
    console.error('Erro no serviço de logout:', error);
    throw error;
  }
};

