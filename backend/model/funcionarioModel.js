import * as db from "../config/database.js";

const table = "funcionarios";

// 1. Retorna todos os funcionários (COM OS NOMES DE LOJA E PERFIL)
export async function getAll() {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        f.*, 
        l.nome as nome_loja,
        p.nome as nome_perfil
      FROM ${table} f
      LEFT JOIN lojas l ON f.loja_id = l.loja_id
      LEFT JOIN perfis p ON f.perfil_id = p.perfil_id
      ORDER BY f.nome_completo ASC
    `;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release();
  }
}

// 2. Retorna um funcionário pelo ID
export async function getById(id) {
  // Usando interpolação conforme seu padrão atual, mas idealmente use '?' e params
  return await db.read(table, `funcionario_id = ${id}`);
}

// 3. Retorna um funcionário pelo e-mail (ESSA É A FUNÇÃO QUE FALTAVA)
export async function getByEmail(email) {
  return await db.read(table, `email = '${email}'`);
}

// 4. Cria um novo funcionário
export async function createFuncionario(data) {
  return await db.create(table, data);
}

// 5. Atualiza um funcionário existente
export async function updateFuncionario(id, data) {
  return await db.update(table, data, `funcionario_id = ${id}`);
}

// 6. Deleta um funcionário pelo ID
export async function deleteFuncionario(id) {
  // Usando o helper do seu db.js para manter padrão
  return await db.deleteRecord(table, `funcionario_id = ${id}`);
}