import { apiService } from './apiService';

// Esta rota deve bater com o que está definido no seu backend/index.js
// Se lá estiver app.use("/api/produto-fornecedor", ...), mantenha assim.
const ENDPOINT = '/produto-fornecedor';

export const linkar = (data, token) => {
  return apiService.post(`${ENDPOINT}/linkar`, data, token);
};

export const deslinkar = (produtoId, fornecedorId, token) => {
  return apiService.delete(`${ENDPOINT}/${produtoId}/${fornecedorId}`, token);
};

export const getFornecedores = (produtoId, token) => {
  return apiService.get(`${ENDPOINT}/produto/${produtoId}`, token);
};

export const getProdutos = (fornecedorId, token) => {
  return apiService.get(`${ENDPOINT}/fornecedor/${fornecedorId}`, token);
};

// --- ADICIONADA: A função que faltava para buscar o preço ---
export const getPrecoCusto = async (fornecedorId, produtoId, token) => {
  // Chama a rota GET /preco/:fornecedorId/:produtoId
  return await apiService.get(`${ENDPOINT}/preco/${fornecedorId}/${produtoId}`, token);
};