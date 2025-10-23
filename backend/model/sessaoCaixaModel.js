// sessaoCaixaModel.js
import * as db from "../config/database.js";


const table = "sessoes_caixa";

// Retorna todas as sessões
export async function getAll() {
  return await db.readAll(table);
}

// Retorna uma sessão específica pelo ID
export async function getById(id) {
  return await db.read(table, `sessao_id = ${id}`);
}

// Cria uma nova sessão de caixa
export async function createSessao(data) {
  return await db.create(table, data);
}

// Atualiza uma sessão de caixa existente
export async function updateSessao(id, data) {
  return await db.update(table, data, `sessao_id = ${id}`);
}

// Deleta uma sessão de caixa
export async function deleteSessao(id) {
  return await db.deleteRecord(table, `sessao_id = ${id}`);
}
