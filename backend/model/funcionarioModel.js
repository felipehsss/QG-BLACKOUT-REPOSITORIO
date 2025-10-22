// funcionarios.js
import db from "../config/database.js";

const table = "funcionarios";

// Funções para manipular dados de funcionários na tabela "funcionarios"

// Retorna todos os funcionários
export async function getAll() {
  return await db.readAll(table);
}

// Retorna um funcionário pelo ID
export async function getById(id) {
  return await db.read(table, `funcionario_id = ${id}`);
}

// Retorna um funcionário pelo e-mail
export async function getByEmail(email) {
  return await db.read(table, `email = '${email}'`);
}

// Cria um novo funcionário
export async function createFuncionario(data) {
  return await db.create(table, data);
}

// Atualiza um funcionário existente
export async function updateFuncionario(id, data) {
  return await db.update(table, data, `funcionario_id = ${id}`);
}

// Deleta um funcionário pelo ID
export async function deleteFuncionario(id) {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      `DELETE FROM ${table} WHERE funcionario_id = ?`,
      [id]
    );
    return result.affectedRows;
  } finally {
    connection.release();
  }
}
