import * as vendaModel from "../model/vendaModel.js";
import { getConnection } from "../config/database.js";

// Listar todas as vendas
export const listar = async (req, res, next) => {
  try {
    const vendas = await vendaModel.getAll();
    res.json(vendas);
  } catch (err) {
    next(err);
  }
};

// Buscar venda por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venda = await vendaModel.getById(id);
    if (!venda) {
      return res.status(404).json({ message: "Venda não encontrada" });
    }
    res.json(venda);
  } catch (err) {
    next(err);
  }
};

// Criar nova venda completa
export const criar = async (req, res, next) => {
  // ADICIONADO: cliente_id no destructuring
  const { loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda, itens, pagamentos } = req.body;

  // Validação
  if (!loja_id || !sessao_id || !funcionario_id || !valor_total || !Array.isArray(itens) || !Array.isArray(pagamentos)) {
    return res.status(400).json({
      message: "Campos obrigatórios: loja_id, sessao_id, funcionario_id, valor_total, itens (array) e pagamentos (array)",
    });
  }

  if (itens.length === 0) {
    return res.status(400).json({ message: "A venda deve ter pelo menos um item." });
  }

  if (pagamentos.length === 0) {
    return res.status(400).json({ message: "A venda deve ter pelo menos um pagamento." });
  }

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. Criar a venda
    // CORREÇÃO: Adicionado cliente_id no INSERT
    const sqlVenda = `
      INSERT INTO vendas (loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [vendaResult] = await connection.execute(sqlVenda, [
      loja_id,
      sessao_id,
      funcionario_id,
      cliente_id || null, // Salva null se não tiver cliente
      valor_total,
      status_venda ?? "Concluída",
    ]);
    const novaVendaId = vendaResult.insertId;

    // 2. Inserir itens e dar baixa no estoque
    const sqlItem = `
      INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario_momento, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const sqlEstoque = `
      UPDATE estoque SET quantidade = quantidade - ?
      WHERE produto_id = ? AND loja_id = ?
    `;

    for (const item of itens) {
      await connection.execute(sqlItem, [
        novaVendaId,
        item.produto_id,
        item.quantidade,
        item.preco_unitario_momento,
        item.subtotal,
      ]);

      const [estoqueResult] = await connection.execute(sqlEstoque, [
        item.quantidade,
        item.produto_id,
        loja_id,
      ]);

      if (estoqueResult.affectedRows === 0) {
        throw new Error(`Estoque indisponível para produto ID ${item.produto_id} na loja ID ${loja_id}.`);
      }
    }

    // 3. Inserir pagamentos
    const sqlPagamento = `
      INSERT INTO pagamentos_venda (venda_id, metodo_pagamento, valor_pago)
      VALUES (?, ?, ?)
    `;
    for (const pgto of pagamentos) {
      await connection.execute(sqlPagamento, [
        novaVendaId,
        pgto.metodo_pagamento,
        pgto.valor_pago,
      ]);
    }

    // 4. Inserir no financeiro
    const sqlFinanceiro = `
      INSERT INTO financeiro (loja_id, tipo, origem, referencia_id, descricao, valor)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(sqlFinanceiro, [
      loja_id,
      "receita", 
      "Venda",
      novaVendaId,
      `Venda Concluída ID ${novaVendaId}`,
      valor_total,
    ]);

    await connection.commit();
    res.status(201).json({ message: "Venda registrada com sucesso!", venda_id: novaVendaId });

  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// Atualizar venda
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await vendaModel.updateVenda(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Venda não encontrada" });
    }

    res.json({ message: "Venda atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar venda
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await vendaModel.deleteVenda(id);
    if (!deletado) {
      return res.status(404).json({ message: "Venda não encontrada" });
    }
    res.json({ message: "Venda removida com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Gerar relatório de vendas
export const getRelatorioVendas = async (req, res, next) => {
  const connection = await getConnection();
  try {
    // Este SQL junta as tabelas de vendas e clientes para obter o nome do cliente.
    const sql = `
      SELECT 
        v.venda_id,
        v.data_venda,
        v.valor_total,
        c.nome AS cliente_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id_cliente
      ORDER BY v.data_venda DESC
    `;
    const [vendas] = await connection.execute(sql);
    res.json({ vendas: vendas });
  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

// Listar vendas por cliente
export const listarPorCliente = async (req, res, next) => {
  const connection = await getConnection();
  try {
    const { id } = req.params;
    
    // Agora que a coluna existe, este SQL funcionará
    const sql = `
      SELECT v.venda_id, v.data_venda, v.valor_total, v.status_venda
      FROM vendas v
      WHERE v.cliente_id = ?
      ORDER BY v.data_venda DESC
    `;
    
    const [vendas] = await connection.execute(sql, [id]);
    res.json(vendas);
  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
};