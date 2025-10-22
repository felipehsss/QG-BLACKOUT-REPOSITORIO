// pagamentoVendaController.js
import * as pagamentoVendaModel from "../model/pagamentoVendaModel.js";

// Listar todos os pagamentos
export const listar = async (req, res, next) => {
  try {
    const pagamentos = await pagamentoVendaModel.getAll();
    res.json(pagamentos);
  } catch (err) {
    next(err);
  }
};

// Buscar pagamento por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pagamento = await pagamentoVendaModel.getById(id);
    if (!pagamento) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }
    res.json(pagamento);
  } catch (err) {
    next(err);
  }
};

// Listar pagamentos de uma venda específica
export const listarPorVenda = async (req, res, next) => {
  try {
    const { venda_id } = req.params;
    const pagamentos = await pagamentoVendaModel.getByVendaId(venda_id);
    res.json(pagamentos);
  } catch (err) {
    next(err);
  }
};

// Criar novo pagamento de venda
export const criar = async (req, res, next) => {
  try {
    const { venda_id, metodo_pagamento, valor_pago } = req.body;

    if (!venda_id || !metodo_pagamento || !valor_pago) {
      return res.status(400).json({
        message: "Campos obrigatórios: venda_id, metodo_pagamento e valor_pago",
      });
    }

    const id = await pagamentoVendaModel.createPagamento({
      venda_id,
      metodo_pagamento,
      valor_pago,
    });

    res.status(201).json({ message: "Pagamento registrado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar pagamento
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await pagamentoVendaModel.updatePagamento(id, dados);
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
    const deletado = await pagamentoVendaModel.deletePagamento(id);
    if (!deletado) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }
    res.json({ message: "Pagamento removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
