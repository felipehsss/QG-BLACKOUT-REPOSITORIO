import * as db from "../config/database.js";

// Criar Pedido de Compra
export async function create(data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Cabeçalho
    const [result] = await conn.execute(
      "INSERT INTO pedidos_compra (fornecedor_id, loja_destino_id, valor_total_estimado, observacao) VALUES (?, ?, ?, ?)",
      [data.fornecedor_id, data.loja_id, data.total, data.observacao]
    );
    const pedidoId = result.insertId;

    // 2. Itens
    for (const item of data.itens) {
      await conn.execute(
        "INSERT INTO itens_pedido_compra (pedido_compra_id, produto_id, quantidade, custo_unitario) VALUES (?, ?, ?, ?)",
        [pedidoId, item.produto_id, item.quantidade, item.custo]
      );
    }

    await conn.commit();
    return { id: pedidoId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function getAll() {
  const sql = `
    SELECT pc.*, f.razao_social as fornecedor_nome, l.nome as loja_nome,
           (SELECT COUNT(*) FROM itens_pedido_compra WHERE pedido_compra_id = pc.pedido_compra_id) as qtd_itens
    FROM pedidos_compra pc
    JOIN fornecedores f ON pc.fornecedor_id = f.fornecedor_id
    JOIN lojas l ON pc.loja_destino_id = l.loja_id
    ORDER BY pc.data_pedido DESC
  `;
  return await db.readWithQuery(sql);
}

export async function getItens(pedidoId) {
  const sql = `
    SELECT i.*, p.nome as produto_nome, p.sku
    FROM itens_pedido_compra i
    JOIN produtos p ON i.produto_id = p.produto_id
    WHERE i.pedido_compra_id = ${pedidoId}
  `;
  return await db.readWithQuery(sql);
}

// LÓGICA DE RECEBIMENTO (CORRIGIDA E COM ASPAS DUPLAS)
export async function receberPedido(pedidoId) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Busca dados do pedido
    const [pedidos] = await conn.execute("SELECT * FROM pedidos_compra WHERE pedido_compra_id = ?", [pedidoId]);
    const pedido = pedidos[0];

    if (!pedido || pedido.status !== "Pendente") throw new Error("Pedido inválido ou já recebido.");

    const [itens] = await conn.execute("SELECT * FROM itens_pedido_compra WHERE pedido_compra_id = ?", [pedidoId]);

    // 2. Processa cada item
    for (const item of itens) {
      // A) Aumenta Estoque
      await conn.execute(`
        INSERT INTO estoque (produto_id, loja_id, quantidade) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantidade = quantidade + ?` ,[item.produto_id, pedido.loja_destino_id, item.quantidade, item.quantidade]

      );

      // B) Atualiza Preço de Custo do Produto (Último preço pago)
      await conn.execute(
        "UPDATE produtos SET preco_custo = ? WHERE produto_id = ?",
        [item.custo_unitario, item.produto_id]
      );
    }

    // 3. Gera Conta a Pagar (Financeiro)
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30); // Vence em 30 dias por padrão

    // CORREÇÃO: Coluna 'categoria' e aspas duplas
    await conn.execute(
      `INSERT INTO contas_a_pagar (loja_id, fornecedor_id, descricao, valor, data_vencimento, categoria, status)
       VALUES (?, ?, ?, ?, ?, 'Fornecedores', 'Pendente')`,
      [
        pedido.loja_destino_id,
        pedido.fornecedor_id,
        `Pedido Compra #${pedidoId}`,
        pedido.valor_total_estimado,
        dataVencimento
      ]
    );

    // 4. Atualiza Status do Pedido
    await conn.execute("UPDATE pedidos_compra SET status = 'Entregue' WHERE pedido_compra_id = ?", [pedidoId]);

    await conn.commit();
    return { success: true };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}