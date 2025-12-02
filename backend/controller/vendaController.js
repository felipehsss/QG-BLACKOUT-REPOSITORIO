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

// Criar nova venda completa (COM DESCONTO DE ESTOQUE)
export const criar = async (req, res, next) => {
  const { loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda, itens, pagamentos } = req.body;

  // Validação básica
  if (!loja_id || !itens || itens.length === 0 || !pagamentos) {
    return res.status(400).json({ message: "Dados incompletos para finalizar a venda." });
  }

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. Criar a venda
    const sqlVenda = `
      INSERT INTO vendas (loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [vendaResult] = await connection.execute(sqlVenda, [
      loja_id, 
      sessao_id || null, 
      funcionario_id, 
      cliente_id || null, 
      valor_total, 
      status_venda ?? "Concluída",
    ]);
    const novaVendaId = vendaResult.insertId;

    // 2. Inserir Itens e Atualizar Estoque
    const sqlItem = `
      INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario_momento, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const sqlVerificaEstoque = "SELECT quantidade FROM estoque WHERE produto_id = ? AND loja_id = ?";
    const sqlAtualizaEstoque = "UPDATE estoque SET quantidade = quantidade - ? WHERE produto_id = ? AND loja_id = ?";

    for (const item of itens) {
      // A. Inserir o item na tabela itens_venda
      await connection.execute(sqlItem, [
        novaVendaId,
        item.produto_id,
        item.quantidade,
        item.preco_unitario_momento,
        item.subtotal
      ]);

      // B. Descontar do Estoque (Se o item existir no estoque dessa loja)
      const [rows] = await connection.execute(sqlVerificaEstoque, [item.produto_id, loja_id]);
      
      if (rows.length > 0) {
        // Item existe no estoque, prosseguir com o desconto
        await connection.execute(sqlAtualizaEstoque, [item.quantidade, item.produto_id, loja_id]);
      } else {
        // Opcional: Se o item não existe no estoque, você pode decidir se:
        // 1. Ignora (permite venda sem controle de estoque) - Comportamento atual
        // 2. Cria o registro com estoque negativo (se seu negócio permitir)
        // 3. Bloqueia a venda (lançando um erro aqui)
        // console.warn(`Produto ${item.produto_id} não encontrado no estoque da loja ${loja_id}. Venda realizada sem baixa.`);
      }
    }

    // 3. Inserir pagamentos e definir forma principal
    const sqlPagamento = "INSERT INTO pagamentos_venda (venda_id, metodo_pagamento, valor_pago) VALUES (?, ?, ?)";
    
    let formaPagamentoPrincipal = "Misto";
    if (pagamentos.length === 1) {
      formaPagamentoPrincipal = pagamentos[0].metodo_pagamento;
    }

    for (const pgto of pagamentos) {
      await connection.execute(sqlPagamento, [novaVendaId, pgto.metodo_pagamento, pgto.valor_pago]);
    }

    // 4. Automação Financeira (Lançar no fluxo de caixa)
    const sqlFinanceiro = `
      INSERT INTO financeiro (loja_id, tipo, categoria_id, origem, referencia_id, descricao, valor, forma_pagamento, data_movimento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    // categoria_id = 1 (Assumindo que 1 seja "Vendas" ou "Receita de Vendas")
    await connection.execute(sqlFinanceiro, [
      loja_id,
      "Entrada",          
      1,                   
      "Venda",
      novaVendaId,
      `Venda #${novaVendaId} - Cliente ID: ${cliente_id || "Avulso"}`,
      valor_total,
      formaPagamentoPrincipal
    ]);

    await connection.commit();
    res.status(201).json({ message: "Venda registrada com sucesso!", venda_id: novaVendaId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Erro ao realizar venda:", err);
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
    if (!linhas) return res.status(404).json({ message: "Venda não encontrada" });
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
    if (!deletado) return res.status(404).json({ message: "Venda não encontrada" });
    res.json({ message: "Venda removida com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Gerar relatório de vendas (A query corrigida que fizemos antes)
export const getRelatorioVendas = async (req, res, next) => {
  const connection = await getConnection();
  try {
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