// produtoController.js
import * as produtoModel from "../model/produtoModel.js";

// Listar todos os produtos
export const listar = async (req, res, next) => {
  try {
    const produtos = await produtoModel.getAll();
    res.json(produtos);
  } catch (err) {
    next(err);
  }
};

// Buscar produto por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produto = await produtoModel.getById(id);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json(produto);
  } catch (err) {
    next(err);
  }
};

// Criar novo produto
export const criar = async (req, res, next) => {
  try {
    const { sku, nome, descricao, preco_venda } = req.body;

    if (!sku || !nome || !preco_venda) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios: sku, nome, preco_venda" });
    }

    const id = await produtoModel.createProduto({
      sku,
      nome,
      descricao,
      preco_venda,
    });

    res.status(201).json({ message: "Produto criado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar produto
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await produtoModel.updateProduto(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar produto
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await produtoModel.deleteProduto(id);
    if (!deletado) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
