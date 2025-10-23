// financeiroModel.js
import * as db from "../config/database.js";


const table = "financeiro";

// Retorna todas as movimentações financeiras
export async function getAll() {
  return await db.readAll(table);
}

// Retorna movimentação por ID
export async function getById(id) {
  return await db.read(table, `financeiro_id = ${id}`);
}

// Retorna movimentações por loja
export async function getByLojaId(loja_id) {
  return await db.readAll(table, `loja_id = ${loja_id}`);
}

// Cria uma nova movimentação financeira
export async function createMovimento(data) {
  return await db.create(table, data);
}

// Atualiza uma movimentação
export async function updateMovimento(id, data) {
  return await db.update(table, data, `financeiro_id = ${id}`);
}

// Deleta uma movimentação
export async function deleteMovimento(id) {
  return await db.deleteRecord(table, `financeiro_id = ${id}`);
}
