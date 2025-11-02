import { api } from "./apiService";

export const produtoService = {
  /**
   * Lista todos os produtos
   */
  listar: async () => {
    return api.get("/produtos");
  },

  /**
   * Busca um produto por ID
   */
  buscarPorId: async (id) => {
    return api.get(`/produtos/${id}`);
  },

  /**
   * Cria um novo produto
   */
  criar: async (dados) => {
    return api.post("/produtos", dados);
  },

  /**
   * Atualiza um produto existente
   */
  atualizar: async (id, dados) => {
    return api.put(`/produtos/${id}`, dados);
  },

  /**
   * Deleta um produto
   */
  deletar: async (id) => {
    return api.delete(`/produtos/${id}`);
  },
};

