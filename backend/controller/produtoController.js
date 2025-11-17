// produtoController.js
import * as produtoModel from "../model/produtoModel.js";

// Listar todos os produtos
export const listar = async (req, res, next) => {
  try {
    const produtos = await produtoModel.getAll();
    res.json(produtos);
  } catch (err) {
    next(err);
  }
};

// Buscar produto por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produto = await produtoModel.getById(id);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json(produto);
  } catch (err) {
    next(err);
  }
};

// Criar novo produto
export const criar = async (req, res, next) => {
  try {
    // [MODIFICADO] Adicionamos 'preco_custo'
    const { sku, nome, descricao, preco_custo, preco_venda } = req.body;

    if (!sku || !nome || !preco_venda) {
      return res.status(400).json({
        message: "Campos obrigatórios: sku, nome e preco_venda",
      });
    }

    // [MODIFICADO] Passamos 'preco_custo' para o model
    const dadosProduto = {
      sku,
      nome,
      descricao,
      preco_custo, // <-- Adicionado
      preco_venda,
    };

    const id = await produtoModel.create(dadosProduto);
    res.status(201).json({ message: "Produto criado com sucesso", id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY" && err.message.includes("sku")) {
      return res.status(409).json({ message: "SKU já cadastrado." });
    }
    next(err);
  }
};

// Atualizar produto
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    // [MODIFICADO] Pegamos 'preco_custo' e passamos direto
    // (O database.js já filtra os campos undefined)
    const dados = req.body; 

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({ message: "Nenhum dado fornecido." });
    }

    const linhas = await produtoModel.update(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY" && err.message.includes("sku")) {
      return res.status(409).json({ message: "SKU já cadastrado." });
    }
    next(err);
  }
};

// Deletar produto
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await produtoModel.deleteProduto(id);
    if (!deletado) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
