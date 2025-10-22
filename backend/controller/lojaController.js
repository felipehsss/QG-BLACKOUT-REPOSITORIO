// lojaController.js
import * as lojaModel from "../model/lojaModel.js";

// Listar todas as lojas
export const listar = async (req, res, next) => {
  try {
    const lojas = await lojaModel.getAll();
    res.json(lojas);
  } catch (err) {
    next(err);
  }
};

// Buscar loja por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loja = await lojaModel.getById(id);
    if (!loja) {
      return res.status(404).json({ message: "Loja não encontrada" });
    }
    res.json(loja);
  } catch (err) {
    next(err);
  }
};

// Criar nova loja
export const criar = async (req, res, next) => {
  try {
    const { nome, cnpj, endereco, telefone, is_matriz, is_ativo } = req.body;

    if (!nome || !cnpj) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios: nome e CNPJ" });
    }

    const id = await lojaModel.createLoja({
      nome,
      cnpj,
      endereco,
      telefone,
      is_matriz: is_matriz ?? false,
      is_ativo: is_ativo ?? true,
    });

    res.status(201).json({ message: "Loja criada com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar loja existente
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await lojaModel.updateLoja(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Loja não encontrada" });
    }

    res.json({ message: "Loja atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar loja
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await lojaModel.deleteLoja(id);
    if (!deletado) {
      return res.status(404).json({ message: "Loja não encontrada" });
    }
    res.json({ message: "Loja removida com sucesso" });
  } catch (err) {
    next(err);
  }
};
