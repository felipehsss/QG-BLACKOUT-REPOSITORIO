// contaPagarController.js
import * as contaPagarModel from "../model/contaPagarModel.js";

// Listar todas as contas a pagar
export const listar = async (req, res, next) => {
  try {
    const contas = await contaPagarModel.getAll();
    res.json(contas);
  } catch (err) {
    next(err);
  }
};

// Buscar conta por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conta = await contaPagarModel.getById(id);
    if (!conta) {
      return res.status(404).json({ message: "Conta a pagar não encontrada" });
    }
    res.json(conta);
  } catch (err) {
    next(err);
  }
};

// Listar contas por loja
export const listarPorLoja = async (req, res, next) => {
  try {
    const { loja_id } = req.params;
    const contas = await contaPagarModel.getByLojaId(loja_id);
    res.json(contas);
  } catch (err) {
    next(err);
  }
};

// Criar nova conta a pagar
export const criar = async (req, res, next) => {
  try {
    const { loja_id, fornecedor_id, descricao, valor, data_vencimento, categoria, status } = req.body;

    if (!loja_id || !descricao || !valor || !data_vencimento || !categoria) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: loja_id, descricao, valor, data_vencimento e categoria",
      });
    }

    const id = await contaPagarModel.createConta({
      loja_id,
      fornecedor_id: fornecedor_id ?? null,
      descricao,
      valor,
      data_vencimento,
      categoria,
      status: status ?? "Pendente",
    });

    res.status(201).json({ message: "Conta a pagar criada com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar conta existente (ex: marcar como paga)
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await contaPagarModel.updateConta(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Conta a pagar não encontrada" });
    }

    res.json({ message: "Conta a pagar atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar conta
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await contaPagarModel.deleteConta(id);
    if (!deletado) {
      return res.status(404).json({ message: "Conta a pagar não encontrada" });
    }
    res.json({ message: "Conta a pagar removida com sucesso" });
  } catch (err) {
    next(err);
  }
};
