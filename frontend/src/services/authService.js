import { apiService } from './apiService';

const ENDPOINT = '/auth';

/**
 * Realiza o login do usuário.
 * @param {string} email - Email do usuário.
 * @param {string} senha - Senha do usuário.
 * @returns {Promise<any>} Resposta da API com token e usuário.
 */
export const loginService = (email, senha) => {
  try {
    // Esta rota não requer token
    return apiService.post(`${ENDPOINT}/login`, { email, senha });
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
