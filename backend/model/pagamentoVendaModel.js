// pagamentoVendaModel.js
import db from "../config/database.js";

const table = "pagamentos_venda";

// Retorna todos os pagamentos
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um pagamento específico pelo ID
export async function getById(id) {
  return await db.read(table, `pagamento_id = ${id}`);
}

// Retorna todos os pagamentos de uma venda específica
export async function getByVendaId(venda_id) {
  return await db.readAll(table, `venda_id = ${venda_id}`);
}

// Cria um novo pagamento de venda
export async function createPagamento(data) {
  return await db.create(table, data);
}

// Atualiza um pagamento existente
export async function updatePagamento(id, data) {
  return await db.update(table, data, `pagamento_id = ${id}`);
}

// Deleta um pagamento
export async function deletePagamento(id) {
  return await db.deleteRecord(table, `pagamento_id = ${id}`);
}
