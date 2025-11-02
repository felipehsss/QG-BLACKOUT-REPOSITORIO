import { api } from "./apiService";

export const contaPagarService = {
  /**
   * Lista todas as contas a pagar
   */
  listar: async () => {
    return api.get("/contas_a_pagar");
  },

  /**
   * Busca uma conta a pagar por ID
   */
  buscarPorId: async (id) => {
    return api.get(`/contas_a_pagar/${id}`);
  },

  /**
   * Lista contas a pagar por loja
   */
  listarPorLoja: async (lojaId) => {
    return api.get(`/contas_a_pagar/loja/${lojaId}`);
  },

  /**
   * Cria uma nova conta a pagar
   */
  criar: async (dados) => {
    return api.post("/contas_a_pagar", dados);
  },

  /**
   * Atualiza uma conta a pagar existente
   */
  atualizar: async (id, dados) => {
    return api.put(`/contas_a_pagar/${id}`, dados);
  },

  /**
   * Deleta uma conta a pagar
   */
  deletar: async (id) => {
    return api.delete(`/contas_a_pagar/${id}`);
  },
};

