import * as db from "../config/database.js";

const table = "produtos";

export async function getAll() {
  const connection = await db.getConnection();
  try {
    // Fazemos um LEFT JOIN para trazer o nome do fornecedor, se existir
    const sql = `
      SELECT p.*, f.razao_social as nome_fornecedor 
      FROM ${table} p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.fornecedor_id
      ORDER BY p.nome ASC
    `;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getById(id) {
  return await db.read(table, "produto_id = ?", [id]);
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