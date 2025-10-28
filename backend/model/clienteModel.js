import * as db from "../config/database.js";

const table = "CLIENTE";
const primaryKey = "id_cliente";

export async function getAll() {
  return await db.readAll(table);
}

export async function getById(id) {
  const result = await db.read(table, `${primaryKey} = ?`, [id]);
  return result[0];
}

export async function getByCpf(cpf) {
  const result = await db.read(table, "cpf = ?", [cpf]);
  return result[0];
}

export async function getByCnpj(cnpj) {
  const result = await db.read(table, "cnpj = ?", [cnpj]);
  return result[0];
}

export async function getByEmail(email) {
  const result = await db.read(table, "email = ?", [email]);
  return result[0];
}

export async function createCliente(data) {
  const clienteData = { ...data };
  clienteData.cpf = (clienteData.tipo_cliente === "PF" && clienteData.cpf) ? clienteData.cpf : null;
  clienteData.cnpj = (clienteData.tipo_cliente === "PJ" && clienteData.cnpj) ? clienteData.cnpj : null;
  clienteData.razao_social = (clienteData.tipo_cliente === "PJ" && clienteData.razao_social) ? clienteData.razao_social : null;
  clienteData.nome_fantasia = (clienteData.tipo_cliente === "PJ" && clienteData.nome_fantasia) ? clienteData.nome_fantasia : null;
  clienteData.inscricao_estadual = (clienteData.tipo_cliente === "PJ" && clienteData.inscricao_estadual) ? clienteData.inscricao_estadual : null;

  if (!clienteData.tipo_cliente) {
    clienteData.tipo_cliente = "PF";
  }

  return await db.create(table, clienteData);
}

export async function updateCliente(id, data) {
  const clienteData = { ...data };
  if (clienteData.tipo_cliente) {
    clienteData.cpf = (clienteData.tipo_cliente === "PF" && clienteData.cpf) ? clienteData.cpf : null;
    clienteData.cnpj = (clienteData.tipo_cliente === "PJ" && clienteData.cnpj) ? clienteData.cnpj : null;
    clienteData.razao_social = (clienteData.tipo_cliente === "PJ" && clienteData.razao_social) ? clienteData.razao_social : null;
    clienteData.nome_fantasia = (clienteData.tipo_cliente === "PJ" && clienteData.nome_fantasia) ? clienteData.nome_fantasia : null;
    clienteData.inscricao_estadual = (clienteData.tipo_cliente === "PJ" && clienteData.inscricao_estadual) ? clienteData.inscricao_estadual : null;
  } else {
    delete clienteData.cpf;
    delete clienteData.cnpj;
    delete clienteData.razao_social;
    delete clienteData.nome_fantasia;
    delete clienteData.inscricao_estadual;
  }

  return await db.update(table, clienteData, `${primaryKey} = ?`, [id]);
}

export async function deleteCliente(id) {
  return await db.del(table, `${primaryKey} = ?`, [id]);
}