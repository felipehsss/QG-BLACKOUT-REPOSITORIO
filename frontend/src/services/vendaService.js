import { api } from "./apiService";

export const vendaService = {
  /**
   * Lista todas as vendas
   * @param {Object} params - Parâmetros de query (inicio, fim, etc)
   */
  listar: async (params = {}) => {
    return api.get("/vendas", params);
  },

  /**
   * Busca uma venda por ID
   */
  buscarPorId: async (id) => {
    return api.get(`/vendas/${id}`);
  },

  /**
   * Cria uma nova venda
   */
  criar: async (dados) => {
    return api.post("/vendas", dados);
  },

  /**
   * Atualiza uma venda existente
   */
  atualizar: async (id, dados) => {
    return api.put(`/vendas/${id}`, dados);
  },

  /**
   * Deleta uma venda
   */
  deletar: async (id) => {
    return api.delete(`/vendas/${id}`);
  },
};

