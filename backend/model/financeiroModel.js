import * as db from "../config/database.js";

const table = "financeiro";

// CRUD Básico
export async function getAll() {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT f.*, c.nome as nome_categoria 
      FROM ${table} f
      LEFT JOIN categorias_financeiras c ON f.categoria_id = c.categoria_id
      ORDER BY f.data_movimento DESC
    `;
    const [rows] = await connection.execute(sql);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getById(id) {
  return await db.read(table, `financeiro_id = ${id}`);
}

export async function getByLojaId(loja_id) {
  return await db.readAll(table, `loja_id = ${loja_id}`);
}

export async function createMovimento(data) {
  return await db.create(table, data);
}

export async function updateMovimento(id, data) {
  return await db.update(table, data, `financeiro_id = ${id}`);
}

export async function deleteMovimento(id) {
  return await db.deleteRecord(table, `financeiro_id = ${id}`);
}

// --- RELATÓRIOS DASHBOARD ---

export async function getKPIs(dataInicio, dataFim) {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo = 'Saída' THEN valor ELSE 0 END) as total_saidas,
        (SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END) - SUM(CASE WHEN tipo = 'Saída' THEN valor ELSE 0 END)) as saldo_periodo
      FROM ${table}
      WHERE data_movimento BETWEEN ? AND ?
    `;
    const [rows] = await connection.execute(sql, [dataInicio, dataFim]);
    return rows[0];
  } finally {
    connection.release();
  }
}

export async function getReportPorCategoria(tipo, dataInicio, dataFim) {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT c.nome, SUM(f.valor) as total
      FROM ${table} f
      LEFT JOIN categorias_financeiras c ON f.categoria_id = c.categoria_id
      WHERE f.tipo = ? AND f.data_movimento BETWEEN ? AND ?
      GROUP BY c.nome
    `;
    const [rows] = await connection.execute(sql, [tipo, dataInicio, dataFim]);
    return rows;
  } finally {
    connection.release();
  }
}

// NOVO: Relatório por Forma de Pagamento
export async function getReportFormasPagamento(tipo, dataInicio, dataFim) {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT forma_pagamento, SUM(valor) as total
      FROM ${table}
      WHERE tipo = ? AND data_movimento BETWEEN ? AND ?
      GROUP BY forma_pagamento
    `;
    const [rows] = await connection.execute(sql, [tipo, dataInicio, dataFim]);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getReportMensal(ano) {
  const connection = await db.getConnection();
  try {
    const sql = `
      SELECT 
        MONTH(data_movimento) as mes,
        SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END) as entradas,
        SUM(CASE WHEN tipo = 'Saída' THEN valor ELSE 0 END) as saidas
      FROM ${table}
      WHERE YEAR(data_movimento) = ?
      GROUP BY MONTH(data_movimento)
      ORDER BY mes ASC
    `;
    const [rows] = await connection.execute(sql, [ano]);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getFluxoCaixa(inicio, fim) {
  const connection = await db.getConnection();
  try {
    // 1. Calcular Saldo Inicial (tudo antes da data 'inicio')
    const sqlSaldo = `
      SELECT SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE -valor END) as saldo_inicial
      FROM ${table}
      WHERE data_movimento < ?
    `;
    const [rowsSaldo] = await connection.execute(sqlSaldo, [inicio]);
    const saldoInicial = Number(rowsSaldo[0]?.saldo_inicial || 0);

    // 2. Buscar Transações do Período
    const sqlTransacoes = `
      SELECT f.*, c.nome as nome_categoria 
      FROM ${table} f
      LEFT JOIN categorias_financeiras c ON f.categoria_id = c.categoria_id
      WHERE f.data_movimento BETWEEN ? AND ?
      ORDER BY f.data_movimento ASC
    `;
    const [transacoes] = await connection.execute(sqlTransacoes, [inicio, fim]);

    // 3. Calcular Totais do Período (para os Cards)
    let totalEntradas = 0;
    let totalSaidas = 0;

    const transacoesFormatadas = transacoes.map(t => {
      const valor = Number(t.valor);
      if (t.tipo === "Entrada") totalEntradas += valor;
      else totalSaidas += valor;
      return { ...t, valor };
    });

    const saldoFinal = saldoInicial + totalEntradas - totalSaidas;

    return {
      transacoes: transacoesFormatadas,
      saldoInicial,
      totalEntradas,
      totalSaidas,
      saldoFinal
    };
  } finally {
    connection.release();
  }
}