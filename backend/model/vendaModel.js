// vendaModel.js
import * as db from "../config/database.js";


const table = "vendas";

// Retorna todas as vendas
export async function getAll() {
  return await db.readAll(table);
}

// Retorna uma venda pelo ID
export async function getById(id) {
  return await db.read(table, `venda_id = ${id}`);
}

// Cria uma nova venda
export async function createVenda(data) {
  return await db.create(table, data);
}

// Atualiza uma venda existente
export async function updateVenda(id, data) {
  return await db.update(table, data, `venda_id = ${id}`);
}

// Deleta uma venda
export async function deleteVenda(id) {
  return await db.deleteRecord(table, `venda_id = ${id}`);
}
