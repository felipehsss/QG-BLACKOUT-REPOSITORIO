// sessaoCaixaController.js
import * as sessaoCaixaModel from "../model/sessaoCaixaModel.js";

// Listar todas as sessões de caixa
export const listar = async (req, res, next) => {
  try {
    const sessoes = await sessaoCaixaModel.getAll();
    res.json(sessoes);
  } catch (err) {
    next(err);
  }
};

// Buscar sessão por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessao = await sessaoCaixaModel.getById(id);
    if (!sessao) {
      return res.status(404).json({ message: "Sessão de caixa não encontrada" });
    }
    res.json(sessao);
  } catch (err) {
    next(err);
  }
};

// Criar nova sessão de caixa
export const criar = async (req, res, next) => {
  try {
    const { loja_id, funcionario_abertura_id, valor_inicial } = req.body;

    if (!loja_id || !funcionario_abertura_id || !valor_inicial) {
      return res.status(400).json({
        message: "Campos obrigatórios: loja_id, funcionario_abertura_id e valor_inicial",
      });
    }

    const id = await sessaoCaixaModel.createSessao({
      loja_id,
      funcionario_abertura_id,
      valor_inicial,
      status: "Aberta",
    });

    res.status(201).json({ message: "Sessão de caixa aberta com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar sessão de caixa (ex: fechamento)
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await sessaoCaixaModel.updateSessao(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Sessão de caixa não encontrada" });
    }

    res.json({ message: "Sessão de caixa atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar sessão de caixa
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await sessaoCaixaModel.deleteSessao(id);
    if (!deletado) {
      return res.status(404).json({ message: "Sessão de caixa não encontrada" });
    }
    res.json({ message: "Sessão de caixa removida com sucesso" });
  } catch (err) {
    next(err);
  }
};
