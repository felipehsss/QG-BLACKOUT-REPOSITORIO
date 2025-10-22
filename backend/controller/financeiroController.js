// financeiroController.js
import * as financeiroModel from "../model/financeiroModel.js";

// Listar todas as movimentações
export const listar = async (req, res, next) => {
  try {
    const registros = await financeiroModel.getAll();
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

// Buscar movimentação por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registro = await financeiroModel.getById(id);
    if (!registro) {
      return res.status(404).json({ message: "Registro financeiro não encontrado" });
    }
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

// Listar movimentações por loja
export const listarPorLoja = async (req, res, next) => {
  try {
    const { loja_id } = req.params;
    const registros = await financeiroModel.getByLojaId(loja_id);
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

// Criar novo registro financeiro
export const criar = async (req, res, next) => {
  try {
    const { loja_id, tipo, origem, referencia_id, descricao, valor } = req.body;

    if (!loja_id || !tipo || !origem || !valor) {
      return res.status(400).json({
        message: "Campos obrigatórios: loja_id, tipo, origem e valor",
      });
    }

    const id = await financeiroModel.createMovimento({
      loja_id,
      tipo,
      origem,
      referencia_id: referencia_id ?? null,
      descricao,
      valor,
    });

    res.status(201).json({ message: "Movimentação financeira criada com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar movimentação
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await financeiroModel.updateMovimento(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Movimentação não encontrada" });
    }

    res.json({ message: "Movimentação atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar movimentação
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await financeiroModel.deleteMovimento(id);
    if (!deletado) {
      return res.status(404).json({ message: "Movimentação não encontrada" });
    }
    res.json({ message: "Movimentação removida com sucesso" });
  } catch (err) {
    next(err);
  }
};
