// produtoModel.js
import * as db from "../config/database.js";


const table = "produtos";

// Retorna todos os produtos
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um produto pelo ID
export async function getById(id) {
  return await db.read(table, `produto_id = ${id}`);
}

// Cria um novo produto
export async function createProduto(data) {
  return await db.create(table, data);
}

// Atualiza um produto existente
export async function updateProduto(id, data) {
  return await db.update(table, data, `produto_id = ${id}`);
}

// Deleta um produto
export async function deleteProduto(id) {
  return await db.deleteRecord(table, `produto_id = ${id}`);
}
