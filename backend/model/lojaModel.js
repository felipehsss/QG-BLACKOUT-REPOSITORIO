// lojaModel.js
import * as db from "../config/database.js";


const table = "lojas";

// Retorna todas as lojas
export async function getAll() {
  return await db.readAll(table);
}

// Retorna uma loja pelo ID
export async function getById(id) {
  return await db.read(table, `loja_id = ${id}`);
}

// Cria uma nova loja
export async function createLoja(data) {
  return await db.create(table, data);
}

// Atualiza uma loja existente
export async function updateLoja(id, data) {
  return await db.update(table, data, `loja_id = ${id}`);
}

// Deleta uma loja
export async function deleteLoja(id) {
  return await db.deleteRecord(table, `loja_id = ${id}`);
}
