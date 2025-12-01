// contaPagarModel.js
import * as db from "../config/database.js";


const table = "contas_a_pagar";

// Retorna todas as contas
export async function getAll() {
  return await db.readAll(table);
}

// Retorna uma conta específica pelo ID
export async function getById(id) {
  return await db.read(table, `conta_pagar_id = ${id}`);
}

// Retorna todas as contas de uma loja específica
export async function getByLojaId(loja_id) {
  return await db.readAll(table, `loja_id = ${loja_id}`);
}

// Cria uma nova conta a pagar
export async function createConta(data) {
  return await db.create(table, data);
}

// Atualiza uma conta existente
export async function updateConta(id, data) {
  return await db.update(table, data, `conta_pagar_id = ${id}`);
}

// Deleta uma conta
export async function deleteConta(id) {
  return await db.deleteRecord(table, `conta_pagar_id = ${id}`);
}

export async function getByFornecedorId(fornecedorId) {
  return await db.read(table, `fornecedor_id = ${fornecedorId}`);
}