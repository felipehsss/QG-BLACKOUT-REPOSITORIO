// backend/model/produtoFornecedorModel.js
import * as db from "../config/database.js";

const table = "produtos_fornecedores";

/**
 * Cria ou atualiza uma ligação entre produto e fornecedor (UPSERT).
 * Se a dupla (produto_id, fornecedor_id) já existe, atualiza o preco_custo.
 */
export async function link(data) {
  const { produto_id, fornecedor_id, preco_custo, sku_fornecedor } = data;
  const connection = await db.getConnection();
  try {
    const sql = `
      INSERT INTO ${table} (produto_id, fornecedor_id, preco_custo, sku_fornecedor)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        preco_custo = VALUES(preco_custo),
        sku_fornecedor = VALUES(sku_fornecedor)
    `;
    const [result] = await connection.execute(sql, [
      produto_id, 
      fornecedor_id, 
      preco_custo, 
      sku_fornecedor || null
    ]);
    return result;
  } finally {
    connection.release();
  }
}

/**
 * Remove uma ligação entre produto e fornecedor
 */
export async function unlink(produtoId, fornecedorId) {
  return await db.deleteRecord(table, `produto_id = ${produtoId} AND fornecedor_id = ${fornecedorId}`);
}

/**
 * Lista todos os fornecedores (com seus preços) para um produto específico
 */
export async function getFornecedoresPorProduto(produtoId) {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        f.fornecedor_id, 
        f.razao_social, 
        f.cnpj, 
        pf.preco_custo, 
        pf.sku_fornecedor
      FROM fornecedores f
      JOIN produtos_fornecedores pf ON f.fornecedor_id = pf.fornecedor_id
      WHERE pf.produto_id = ?
    `;
    const [rows] = await connection.execute(sql, [produtoId]);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Lista todos os produtos (com seus custos) de um fornecedor específico
 */
export async function getProdutosPorFornecedor(fornecedorId) {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        p.produto_id, 
        p.nome, 
        p.sku, 
        pf.preco_custo, 
        pf.sku_fornecedor
      FROM produtos p
      JOIN produtos_fornecedores pf ON p.produto_id = pf.produto_id
      WHERE pf.fornecedor_id = ?
    `;
    const [rows] = await connection.execute(sql, [fornecedorId]);
    return rows;
  } finally {
    connection.release();
  }
}