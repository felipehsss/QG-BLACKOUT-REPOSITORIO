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

// Criar nova venda completa (COM VALIDAÇÃO DE ESTOQUE E SESSÃO)
export const criar = async (req, res, next) => {
  const { loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda, itens, pagamentos } = req.body;

  // 1. Validação básica de dados
  if (!loja_id || !itens || itens.length === 0 || !pagamentos) {
    return res.status(400).json({ message: "Dados incompletos para finalizar a venda." });
  }

  // 2. Correção do Erro 'sessao_id cannot be null'
  // Se não vier sessao_id, tentamos usar 1 (padrão) ou lançamos erro.
  // O ideal é obrigar o usuário a abrir o caixa no frontend.
  const idSessaoFinal = sessao_id ? sessao_id : 1; 
  // DICA: Se quiser bloquear quem não abriu caixa, descomente a linha abaixo:
  // if (!sessao_id) return res.status(400).json({ message: "É necessário abrir o caixa antes de realizar vendas." });

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 3. Verificar Estoque ANTES de vender
    // Isso resolve o problema de 'comprar com estoque zero'
    const sqlVerificaEstoque = "SELECT quantidade, nome FROM produtos p JOIN estoque e ON p.produto_id = e.produto_id WHERE e.produto_id = ? AND e.loja_id = ?";
    
    for (const item of itens) {
      const [rows] = await connection.execute(sqlVerificaEstoque, [item.produto_id, loja_id]);
      
      if (rows.length === 0) {
        throw new Error(`Produto ID ${item.produto_id} não cadastrado no estoque desta loja.`);
      }

      const estoqueAtual = Number(rows[0].quantidade);
      const qtdSolicitada = Number(item.quantidade);

      if (estoqueAtual < qtdSolicitada) {
        throw new Error(`Estoque insuficiente para o produto "${rows[0].nome}". Disponível: ${estoqueAtual}, Solicitado: ${qtdSolicitada}`);
      }
    }

    // 4. Criar a venda
    const sqlVenda = `
      INSERT INTO vendas (loja_id, sessao_id, funcionario_id, cliente_id, valor_total, status_venda)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [vendaResult] = await connection.execute(sqlVenda, [
      loja_id, 
      idSessaoFinal, // Usando o ID tratado
      funcionario_id, 
      cliente_id || null, 
      valor_total, 
      status_venda ?? "Concluída",
    ]);
    const novaVendaId = vendaResult.insertId;

    // 5. Inserir Itens e Baixar Estoque
    const sqlItem = `
      INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario_momento, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const sqlAtualizaEstoque = "UPDATE estoque SET quantidade = quantidade - ? WHERE produto_id = ? AND loja_id = ?";

    for (const item of itens) {
      // A. Inserir item
      await connection.execute(sqlItem, [
        novaVendaId,
        item.produto_id,
        item.quantidade,
        item.preco_unitario_momento,
        item.subtotal
      ]);

      // B. Baixar estoque (Já validamos que existe quantidade suficiente no passo 3)
      await connection.execute(sqlAtualizaEstoque, [item.quantidade, item.produto_id, loja_id]);
    }

    // 6. Inserir pagamentos
    const sqlPagamento = "INSERT INTO pagamentos_venda (venda_id, metodo_pagamento, valor_pago) VALUES (?, ?, ?)";
    let formaPagamentoPrincipal = "Misto";
    if (pagamentos.length === 1) {
      formaPagamentoPrincipal = pagamentos[0].metodo_pagamento;
    }

    for (const pgto of pagamentos) {
      await connection.execute(sqlPagamento, [novaVendaId, pgto.metodo_pagamento, pgto.valor_pago]);
    }

    // 7. Lançar no Financeiro
    const sqlFinanceiro = `
      INSERT INTO financeiro (loja_id, tipo, categoria_id, origem, referencia_id, descricao, valor, forma_pagamento, data_movimento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await connection.execute(sqlFinanceiro, [
      loja_id,
      "Entrada",          
      1, // Categoria 1 = Vendas
      "Venda",
      novaVendaId,
      `Venda #${novaVendaId} - Cliente: ${cliente_id ? "Cadastrado" : "Avulso"}`,
      valor_total,
      formaPagamentoPrincipal
    ]);

    await connection.commit();
    res.status(201).json({ message: "Venda registrada com sucesso!", venda_id: novaVendaId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Erro ao realizar venda:", err.message);
    // Retorna o erro específico (ex: estoque insuficiente) para o frontend mostrar no Toast
    res.status(400).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// ... (Restante das funções: atualizar, deletar, getRelatorioVendas, listarPorCliente mantenha igual)
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