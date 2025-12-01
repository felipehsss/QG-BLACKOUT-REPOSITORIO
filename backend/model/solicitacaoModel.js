// backend/model/solicitacaoModel.js
import * as db from "../config/database.js";

export async function create(loja_id, observacao, itens) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      "INSERT INTO solicitacoes_estoque (loja_solicitante_id, observacao) VALUES (?, ?)",
      [loja_id, observacao]
    );

    const solicitacaoId = result.insertId;

    for (const item of itens) {
      await conn.execute(
        "INSERT INTO itens_solicitacao (solicitacao_id, produto_id, quantidade_solicitada) VALUES (?, ?, ?)",
        [solicitacaoId, item.produto_id, item.quantidade]
      );
    }

    await conn.commit();
    return { id: solicitacaoId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function getAll() {
  const sql = `
    SELECT s.*, l.nome AS loja_nome, 
           (SELECT COUNT(*) FROM itens_solicitacao WHERE solicitacao_id = s.solicitacao_id) AS qtd_itens
    FROM solicitacoes_estoque s
    JOIN lojas l ON s.loja_solicitante_id = l.loja_id
    ORDER BY s.data_solicitacao DESC
  `;
  return await db.readWithQuery(sql);
}

export async function getItensBySolicitacao(id) {
  const sql = `
    SELECT i.*, p.nome AS produto_nome, p.sku
    FROM itens_solicitacao i
    JOIN produtos p ON i.produto_id = p.produto_id
    WHERE i.solicitacao_id = ${id}
  `;
  return await db.readWithQuery(sql);
}

export async function reject(id) {
  return await db.update(
    "solicitacoes_estoque",
    { status: "Rejeitada" },
    `solicitacao_id = ${id}`
  );
}

// ETAPA 1 – Matriz despacha
export async function despachar(id, idMatriz = 1) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [solicitacao] = await conn.execute(
      "SELECT * FROM solicitacoes_estoque WHERE solicitacao_id = ?",
      [id]
    );

    if (!solicitacao[0] || solicitacao[0].status !== "Pendente") {
      throw new Error("Pedido não está pendente.");
    }

    const [itens] = await conn.execute(
      "SELECT * FROM itens_solicitacao WHERE solicitacao_id = ?",
      [id]
    );

    for (const item of itens) {
      const [estoqueMatriz] = await conn.execute(
        "SELECT quantidade FROM estoque WHERE loja_id = ? AND produto_id = ? FOR UPDATE",
        [idMatriz, item.produto_id]
      );

      const qtd = estoqueMatriz[0]?.quantidade || 0;

      if (qtd < item.quantidade_solicitada) {
        throw new Error(
          "Estoque insuficiente na Matriz para o item ID " + item.produto_id
        );
      }

      await conn.execute(
        "UPDATE estoque SET quantidade = quantidade - ? WHERE loja_id = ? AND produto_id = ?",
        [item.quantidade_solicitada, idMatriz, item.produto_id]
      );
    }

    await conn.execute(
      "UPDATE solicitacoes_estoque SET status = \"Em Trânsito\" WHERE solicitacao_id = ?",
      [id]
    );

    await conn.commit();
    return { success: true };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// ETAPA 2 – Filial recebe
export async function receber(id) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [solicitacao] = await conn.execute(
      "SELECT * FROM solicitacoes_estoque WHERE solicitacao_id = ?",
      [id]
    );

    if (!solicitacao[0] || solicitacao[0].status !== "Em Trânsito") {
      throw new Error("Pedido não está em trânsito.");
    }

    const lojaDestino = solicitacao[0].loja_solicitante_id;

    const [itens] = await conn.execute(
      "SELECT * FROM itens_solicitacao WHERE solicitacao_id = ?",
      [id]
    );

    for (const item of itens) {
      await conn.execute(
        "INSERT INTO estoque (produto_id, loja_id, quantidade) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantidade = quantidade + ?",
        [
          item.produto_id,
          lojaDestino,
          item.quantidade_solicitada,
          item.quantidade_solicitada
        ]
      );
    }

    await conn.execute(
      "UPDATE solicitacoes_estoque SET status = \"Concluída\" WHERE solicitacao_id = ?",
      [id]
    );

    await conn.commit();
    return { success: true };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
