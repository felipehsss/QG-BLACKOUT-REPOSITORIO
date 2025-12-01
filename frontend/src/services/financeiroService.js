import { apiService } from "./apiService";

const ENDPOINT = "/financeiro"; // Constante corrigida

// CRUD
export const readAll = (token) => apiService.get(ENDPOINT, token);
export const readById = (id, token) => apiService.get(`${ENDPOINT}/${id}`, token);
export const getByLoja = (lojaId, token) => apiService.get(`${ENDPOINT}/loja/${lojaId}`, token);
export const create = (data, token) => apiService.post(ENDPOINT, data, token);
export const update = (id, data, token) => apiService.put(`${ENDPOINT}/${id}`, data, token);
export const deleteRecord = (id, token) => apiService.delete(`${ENDPOINT}/${id}`, token);

// Fluxo de Caixa (Lista)
export const getFluxoCaixa = async (inicio, fim, token) => {
  const queryString = `?inicio=${inicio}&fim=${fim}`;
  return apiService.get(`${ENDPOINT}/fluxo-caixa${queryString}`, token);
};

// DASHBOARD
export const getDashboardKPIs = async (inicio, fim, token) => {
  const queryString = `?inicio=${inicio}&fim=${fim}`;
  return apiService.get(`${ENDPOINT}/dashboard/kpis${queryString}`, token);
};

export const getDashboardCategorias = async (tipo, inicio, fim, token) => {
  const queryString = `?tipo=${tipo}&inicio=${inicio}&fim=${fim}`;
  return apiService.get(`${ENDPOINT}/dashboard/categorias${queryString}`, token);
};

export const getDashboardFormasPagamento = async (tipo, inicio, fim, token) => {
  const queryString = `?tipo=${tipo}&inicio=${inicio}&fim=${fim}`;
  return apiService.get(`${ENDPOINT}/dashboard/formas-pagamento${queryString}`, token);
};

export const getDashboardAnual = async (ano, token) => {
  return apiService.get(`${ENDPOINT}/dashboard/anual?ano=${ano}`, token);
};