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
  const { loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda, itens, pagamentos } = req.body;

  // ... validações (iguais ao seu arquivo original) ...

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. Criar a venda (Igual ao seu)
    const sqlVenda = `
      INSERT INTO vendas (loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [vendaResult] = await connection.execute(sqlVenda, [
      loja_id, sessao_id, funcionario_id, cliente_id || null, valor_total, status_venda ?? "Concluída",
    ]);
    const novaVendaId = vendaResult.insertId;

    // 2. Itens e Estoque (Igual ao seu) ... (Código omitido para brevidade, mantenha o seu loop) ...
    // REPLIQUE O LOOP DE ITENS AQUI

    // 3. Inserir pagamentos e definir forma principal
    const sqlPagamento = "INSERT INTO pagamentos_venda (venda_id, metodo_pagamento, valor_pago) VALUES (?, ?, ?)";

    let formaPagamentoPrincipal = "Misto";
    if (pagamentos.length === 1) {
      formaPagamentoPrincipal = pagamentos[0].metodo_pagamento;
    }

    for (const pgto of pagamentos) {
      await connection.execute(sqlPagamento, [novaVendaId, pgto.metodo_pagamento, pgto.valor_pago]);
    }

    // 4. AUTOMAÇÃO FINANCEIRA ATUALIZADA
    // Insere no financeiro com Categoria ID 1 (Vendas) e forma de pagamento correta
    const sqlFinanceiro = `
      INSERT INTO financeiro (loja_id, tipo, categoria_id, origem, referencia_id, descricao, valor, forma_pagamento, data_movimento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await connection.execute(sqlFinanceiro, [
      loja_id,
      "Entrada",           // Tipo padronizado
      1,                   // ID 1 = Vendas de Produtos (conforme SQL do passo 1)
      "Venda",
      novaVendaId,
      `Venda #${novaVendaId} - Cliente: ${cliente_id ? cliente_id : "Balcão"}`,
      valor_total,
      formaPagamentoPrincipal
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


// ... imports existentes ...

// Gerar relatório de vendas (ATUALIZADO)
// backend/controller/vendaController.js

export const getRelatorioVendas = async (req, res, next) => {
  const connection = await getConnection();
  try {
    // A query foi ajustada para sua estrutura de tabelas:
    // 1. Usa 'preco_unitario_momento' da tabela itens_venda
    // 2. Faz JOIN com clientes, itens_venda e produtos
    const sql = `
      SELECT 
        v.venda_id,
        v.data_venda,
        v.status_venda,
        c.nome AS cliente_nome,
        p.nome AS produto_nome,
        iv.quantidade, 
        iv.preco_unitario_momento AS valor_unitario,
        iv.subtotal AS item_total
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id_cliente
      LEFT JOIN itens_venda iv ON v.venda_id = iv.venda_id
      LEFT JOIN produtos p ON iv.produto_id = p.produto_id
      ORDER BY v.data_venda DESC, v.venda_id DESC
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