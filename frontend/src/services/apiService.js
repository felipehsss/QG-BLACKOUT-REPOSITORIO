// Define a URL base da sua API Express.
// O ideal é que esta venha de uma variável de ambiente.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Lida com a resposta da API, tratando sucessos e erros.
 * @param {Response} response - A resposta do fetch.
 * @returns {Promise<any>} Os dados em JSON.
 * @throws {Error} Lança um erro se a resposta não for 'ok'.
 */

// Função para tratar a resposta da API
const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // Se a resposta não for OK, constrói uma mensagem de erro
    const error = (data && data.message) || response.statusText || `Erro ${response.status}`;
    // Lança um erro que pode ser pego pelo .catch() da chamada
    throw new Error(error);
  }

  return data;
};

/**
 * Cria os headers para a requisição, incluindo o token de autenticação.
 * @param {string} [token] - O token JWT (opcional).
 * @returns {HeadersInit} Os headers da requisição.
 */
const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Função de requisição genérica que usa fetch.
 * @param {string} endpoint - O endpoint da API (ex: '/produtos').
 * @param {RequestInit} options - As opções do fetch (method, body, etc).
 * @param {string} [token] - O token JWT (opcional).
 * @returns {Promise<any>} Os dados da resposta.
 */
const request = async (endpoint, options, token) => {
  const config = {
    ...options,
    headers: getHeaders(token),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error.message);
    // Propaga o erro para que a UI possa tratá-lo
    throw error;
  }
};

// Exporta métodos HTTP simplificados
export const apiService = {
  /**
   * Realiza uma requisição GET.
   * @param {string} endpoint - O endpoint da API.
   * @param {string} [token] - O token JWT.
   * @returns {Promise<any>}
   */
  get: (endpoint, token) => request(endpoint, { method: 'GET' }, token),

  /**
   * Realiza uma requisição POST.
   * @param {string} endpoint - O endpoint da API.
   * @param {object} data - O corpo (body) da requisição.
   * @param {string} [token] - O token JWT.
   * @returns {Promise<any>}
   */
  post: (endpoint, data, token) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }, token),

  /**
   * Realiza uma requisição PUT.
   * @param {string} endpoint - O endpoint da API.
   * @param {object} data - O corpo (body) da requisição.
   * @param {string} [token] - O token JWT.
   * @returns {Promise<any>}
   */
  put: (endpoint, data, token) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }, token),

  /**
   * Realiza uma requisição DELETE.
   * @param {string} endpoint - O endpoint da API.
   * @param {string} [token] - O token JWT.
   * @returns {Promise<any>}
   */
  delete: (endpoint, token) => request(endpoint, { method: 'DELETE' }, token),
};
