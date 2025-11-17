// backend/model/estoqueModel.js
import * as db from "../config/database.js";

const table = "estoque";

/**
 * Lista todo o estoque, juntando os nomes de produtos e lojas.
 * Esta é uma consulta personalizada, pois o db.readAll() não faz JOINs.
 */
export async function getAll() {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        e.estoque_id,
        p.produto_id,
        p.nome as produto_nome,
        p.sku,
        l.loja_id,
        l.nome as loja_nome,
        e.quantidade
      FROM estoque e
      JOIN produtos p ON e.produto_id = p.produto_id
      JOIN lojas l ON e.loja_id = l.loja_id
      ORDER BY l.nome, p.nome;
    `;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release();
  }
}

// Retorna um item de estoque pelo ID
export async function getById(id) {
  return await db.read(table, `estoque_id = ${id}`);
}

// Retorna o estoque de um produto em uma loja específica
export async function getByProdutoELoja(produtoId, lojaId) {
  return await db.read(table, `produto_id = ${produtoId} AND loja_id = ${lojaId}`);
}

/**
 * Adiciona ou atualiza a quantidade de um item no estoque (Dar Entrada).
 * Usa uma query customizada para o "ON DUPLICATE KEY UPDATE".
 */
export async function createOrUpdate(data) {
  const { produto_id, loja_id, quantidade } = data;
  const connection = await db.getConnection();
  try {
    const query = `
      INSERT INTO estoque (produto_id, loja_id, quantidade)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantidade = quantidade + ?;
    `;
    // A quantidade é passada duas vezes: uma para o INSERT, outra para o UPDATE
    const [result] = await connection.execute(query, [produto_id, loja_id, quantidade, quantidade]);
    return result;
  } finally {
    connection.release();
  }
}

// Atualiza a quantidade (para ajuste manual)
export async function updateEstoque(id, data) {
  return await db.update(table, data, `estoque_id = ${id}`);
}

// Deleta um item do estoque
export async function deleteEstoque(id) {
  return await db.deleteRecord(table, `estoque_id = ${id}`);
}