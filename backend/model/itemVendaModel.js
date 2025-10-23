// itemVendaModel.js
import * as db from "../config/database.js";


const table = "itens_venda";

// Retorna todos os itens de venda
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um item de venda específico pelo ID
export async function getById(id) {
  return await db.read(table, `item_venda_id = ${id}`);
}

// Retorna todos os itens de uma venda específica
export async function getByVendaId(venda_id) {
  return await db.readAll(table, `venda_id = ${venda_id}`);
}

// Cria um novo item de venda
export async function createItemVenda(data) {
  return await db.create(table, data);
}

// Atualiza um item de venda
export async function updateItemVenda(id, data) {
  return await db.update(table, data, `item_venda_id = ${id}`);
}

// Deleta um item de venda
export async function deleteItemVenda(id) {
  return await db.deleteRecord(table, `item_venda_id = ${id}`);
}
