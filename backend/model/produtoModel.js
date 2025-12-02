import * as db from "../config/database.js";

const table = "produtos";

export async function getAll() {
  const connection = await db.getConnection();
  try {
    // ATUALIZAÇÃO: Adicionado LEFT JOIN com 'estoque' e SUM(quantidade)
    // Usamos GROUP BY para garantir que se houver estoque em múltiplas lojas, ele some tudo.
    const sql = `
      SELECT 
        p.*, 
        f.razao_social as nome_fornecedor,
        COALESCE(SUM(e.quantidade), 0) as quantidade
      FROM ${table} p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.fornecedor_id
      LEFT JOIN estoque e ON p.produto_id = e.produto_id
      GROUP BY p.produto_id
      ORDER BY p.nome ASC
    `;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getById(id) {
  // O ideal seria atualizar aqui também se você usa essa função para ver detalhes com estoque
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        p.*, 
        f.razao_social as nome_fornecedor,
        COALESCE(SUM(e.quantidade), 0) as quantidade
      FROM ${table} p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.fornecedor_id
      LEFT JOIN estoque e ON p.produto_id = e.produto_id
      WHERE p.produto_id = ?
      GROUP BY p.produto_id
    `;
    const [rows] = await connection.execute(sql, [id]);
    return rows[0];
  } finally {
    connection.release();
  }
}

export async function createProduto(data) {
  return await db.create(table, data);
}

export async function updateProduto(id, data) {
  return await db.update(table, data, "produto_id = ?", [id]);
}

export async function deleteProduto(id) {
  return await db.deleteRecord(table, "produto_id = ?", [id]);
}