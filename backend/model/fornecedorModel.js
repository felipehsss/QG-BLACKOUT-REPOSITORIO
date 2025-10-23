// fornecedorModel.js
import * as db from "../config/database.js";


const table = "fornecedores";

// Retorna todos os fornecedores
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um fornecedor pelo ID
export async function getById(id) {
  return await db.read(table, `fornecedor_id = ${id}`);
}

// Cria um novo fornecedor
export async function createFornecedor(data) {
  return await db.create(table, data);
}

// Atualiza um fornecedor existente
export async function updateFornecedor(id, data) {
  return await db.update(table, data, `fornecedor_id = ${id}`);
}

// Deleta um fornecedor
export async function deleteFornecedor(id) {
  return await db.deleteRecord(table, `fornecedor_id = ${id}`);
}
