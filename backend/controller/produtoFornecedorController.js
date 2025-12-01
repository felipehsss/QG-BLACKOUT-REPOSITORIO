// backend/controller/produtoFornecedorController.js
import * as pfModel from "../model/produtoFornecedorModel.js";
import * as db from "../config/database.js";

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

// Função corrigida e simplificada usando readWithQuery
export const buscarPreco = async (req, res, next) => {
  try {
    const { fornecedorId, produtoId } = req.params;
    
    // 1. Tenta achar o preço específico desse fornecedor
    const sqlEspecifico = `
      SELECT preco_custo 
      FROM produtos_fornecedores 
      WHERE fornecedor_id = ? AND produto_id = ?
    `;
    
    // Usamos readWithQuery que já trata a conexão
    const especifico = await db.readWithQuery(sqlEspecifico, [fornecedorId, produtoId]);

    if (especifico && especifico.length > 0) {
      return res.json({ preco: Number(especifico[0].preco_custo), fonte: "tabela_fornecedor" });
    }

    // 2. Se não achar, busca o último custo geral do produto (fallback)
    const sqlGeral = "SELECT preco_custo FROM produtos WHERE produto_id = ?";
    const geral = await db.readWithQuery(sqlGeral, [produtoId]);

    if (geral && geral.length > 0) {
      return res.json({ preco: Number(geral[0].preco_custo), fonte: "cadastro_produto" });
    }

    // 3. Se não tiver nada, retorna 0
    res.json({ preco: 0, fonte: "nenhum" });

  } catch (err) {
    next(err);
  }
};