// backend/controller/produtoFornecedorController.js
import * as pfModel from "../model/produtoFornecedorModel.js";

/**
 * Linka um produto a um fornecedor ou atualiza o custo.
 * Espera no body: { produto_id, fornecedor_id, preco_custo, sku_fornecedor? }
 */
export const linkar = async (req, res, next) => {
  try {
    const { produto_id, fornecedor_id, preco_custo } = req.body;
    if (!produto_id || !fornecedor_id || preco_custo === undefined) {
      return res.status(400).json({ message: "Campos obrigatórios: produto_id, fornecedor_id, preco_custo." });
    }
    
    const result = await pfModel.link(req.body);
    res.status(201).json({ message: "Linkagem criada/atualizada com sucesso", result });
  } catch (err) {
    next(err);
  }
};

/**
 * Deslinka um produto de um fornecedor.
 * Espera nos params: /:produtoId/:fornecedorId
 */
export const deslinkar = async (req, res, next) => {
  try {
    const { produtoId, fornecedorId } = req.params;
    const deletado = await pfModel.unlink(produtoId, fornecedorId);
    if (!deletado) {
      return res.status(404).json({ message: "Linkagem não encontrada" });
    }
    res.json({ message: "Linkagem removida com sucesso" });
  } catch (err) {
    next(err);
  }
};

/**
 * Lista fornecedores de um produto.
 * Espera nos params: /produto/:produtoId
 */
export const listarFornecedores = async (req, res, next) => {
  try {
    const { produtoId } = req.params;
    const fornecedores = await pfModel.getFornecedoresPorProduto(produtoId);
    res.json(fornecedores);
  } catch (err) {
    next(err);
  }
};

/**
 * Lista produtos de um fornecedor.
 * Espera nos params: /fornecedor/:fornecedorId
 */
export const listarProdutos = async (req, res, next) => {
  try {
    const { fornecedorId } = req.params;
    const produtos = await pfModel.getProdutosPorFornecedor(fornecedorId);
    res.json(produtos);
  } catch (err) {
    next(err);
  }
};