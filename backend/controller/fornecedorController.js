// fornecedorController.js
import * as fornecedorModel from "../model/fornecedorModel.js";

// Listar todos os fornecedores
export const listar = async (req, res, next) => {
  try {
    const fornecedores = await fornecedorModel.getAll();
    res.json(fornecedores);
  } catch (err) {
    next(err);
  }
};

// Buscar fornecedor por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fornecedor = await fornecedorModel.getById(id);
    if (!fornecedor) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    res.json(fornecedor);
  } catch (err) {
    next(err);
  }
};

// Criar novo fornecedor
export const criar = async (req, res, next) => {
  try {
    const { razao_social, cnpj, contato_principal, email, telefone } = req.body;

    if (!razao_social || !cnpj) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios: razão social e CNPJ" });
    }

    const id = await fornecedorModel.createFornecedor({
      razao_social,
      cnpj,
      contato_principal,
      email,
      telefone,
    });

    res.status(201).json({ message: "Fornecedor criado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar fornecedor existente
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await fornecedorModel.updateFornecedor(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }

    res.json({ message: "Fornecedor atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar fornecedor
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await fornecedorModel.deleteFornecedor(id);
    if (!deletado) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    res.json({ message: "Fornecedor removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
