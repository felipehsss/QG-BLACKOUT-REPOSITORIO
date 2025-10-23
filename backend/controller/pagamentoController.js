// pagamentoContaController.js
import * as pagamentoContaModel from "../model/pagamentoModel.js";

// Listar todos os pagamentos de contas
export const listar = async (req, res, next) => {
  try {
    const pagamentos = await pagamentoContaModel.getAll();
    res.json(pagamentos);
  } catch (err) {
    next(err);
  }
};

// Buscar pagamento por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pagamento = await pagamentoContaModel.getById(id);
    if (!pagamento) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }
    res.json(pagamento);
  } catch (err) {
    next(err);
  }
};

// Listar pagamentos de uma conta específica
export const listarPorConta = async (req, res, next) => {
  try {
    const { conta_pagar_id } = req.params;
    const pagamentos = await pagamentoContaModel.getByContaId(conta_pagar_id);
    res.json(pagamentos);
  } catch (err) {
    next(err);
  }
};

// Criar novo pagamento de conta
export const criar = async (req, res, next) => {
  try {
    const { conta_pagar_id, loja_id, data_pagamento, valor_pago, metodo_pagamento, observacao } = req.body;

    if (!conta_pagar_id || !loja_id || !data_pagamento || !valor_pago || !metodo_pagamento) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: conta_pagar_id, loja_id, data_pagamento, valor_pago, metodo_pagamento",
      });
    }

    const id = await pagamentoContaModel.createPagamento({
      conta_pagar_id,
      loja_id,
      data_pagamento,
      valor_pago,
      metodo_pagamento,
      observacao,
    });

    res.status(201).json({ message: "Pagamento de conta registrado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar pagamento
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await pagamentoContaModel.updatePagamento(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    res.json({ message: "Pagamento atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar pagamento
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await pagamentoContaModel.deletePagamento(id);
    if (!deletado) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }
    res.json({ message: "Pagamento removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
