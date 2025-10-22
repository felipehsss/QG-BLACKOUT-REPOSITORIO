// pagamentoContaModel.js
import db from "../config/database.js";

const table = "pagamentos_conta";

// Retorna todos os pagamentos
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um pagamento pelo ID
export async function getById(id) {
  return await db.read(table, `pagamento_conta_id = ${id}`);
}

// Retorna todos os pagamentos de uma conta específica
export async function getByContaId(conta_pagar_id) {
  return await db.readAll(table, `conta_pagar_id = ${conta_pagar_id}`);
}

// Cria um novo pagamento de conta
export async function createPagamento(data) {
  return await db.create(table, data);
}

// Atualiza um pagamento
export async function updatePagamento(id, data) {
  return await db.update(table, data, `pagamento_conta_id = ${id}`);
}

// Deleta um pagamento
export async function deletePagamento(id) {
  return await db.deleteRecord(table, `pagamento_conta_id = ${id}`);
}
