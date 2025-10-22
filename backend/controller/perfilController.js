// perfilController.js
import * as perfilModel from "../model/perfilModel.js";

// Listar todos os perfis
export const listar = async (req, res, next) => {
  try {
    const perfis = await perfilModel.getAll();
    res.json(perfis);
  } catch (err) {
    next(err);
  }
};

// Buscar perfil por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const perfil = await perfilModel.getById(id);
    if (!perfil) {
      return res.status(404).json({ message: "Perfil não encontrado" });
    }
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

// Criar novo perfil
export const criar = async (req, res, next) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Campo obrigatório: nome" });
    }

    const id = await perfilModel.createPerfil({ nome, descricao });
    res.status(201).json({ message: "Perfil criado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar perfil
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await perfilModel.updatePerfil(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Perfil não encontrado" });
    }

    res.json({ message: "Perfil atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar perfil
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await perfilModel.deletePerfil(id);
    if (!deletado) {
      return res.status(404).json({ message: "Perfil não encontrado" });
    }
    res.json({ message: "Perfil removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
