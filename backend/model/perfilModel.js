// perfilModel.js
import * as db from "../config/database.js";


const table = "perfis";

// Retorna todos os perfis
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um perfil pelo ID
export async function getById(id) {
  return await db.read(table, `perfil_id = ${id}`);
}

// Cria um novo perfil
export async function createPerfil(data) {
  return await db.create(table, data);
}

// Atualiza um perfil existente
export async function updatePerfil(id, data) {
  return await db.update(table, data, `perfil_id = ${id}`);
}

// Deleta um perfil
export async function deletePerfil(id) {
  return await db.deleteRecord(table, `perfil_id = ${id}`);
}
