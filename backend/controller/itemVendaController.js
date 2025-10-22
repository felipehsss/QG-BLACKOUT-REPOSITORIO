// itemVendaController.js
import * as itemVendaModel from "../model/itemVendaModel.js";

// Listar todos os itens de venda
export const listar = async (req, res, next) => {
  try {
    const itens = await itemVendaModel.getAll();
    res.json(itens);
  } catch (err) {
    next(err);
  }
};

// Buscar item de venda por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await itemVendaModel.getById(id);
    if (!item) {
      return res.status(404).json({ message: "Item de venda não encontrado" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Listar itens de uma venda específica
export const listarPorVenda = async (req, res, next) => {
  try {
    const { venda_id } = req.params;
    const itens = await itemVendaModel.getByVendaId(venda_id);
    res.json(itens);
  } catch (err) {
    next(err);
  }
};

// Criar novo item de venda
export const criar = async (req, res, next) => {
  try {
    const { venda_id, produto_id, quantidade, preco_unitario_momento, subtotal } = req.body;

    if (!venda_id || !produto_id || !quantidade || !preco_unitario_momento) {
      return res.status(400).json({
        message: "Campos obrigatórios: venda_id, produto_id, quantidade, preco_unitario_momento",
      });
    }

    const id = await itemVendaModel.createItemVenda({
      venda_id,
      produto_id,
      quantidade,
      preco_unitario_momento,
      subtotal: subtotal ?? quantidade * preco_unitario_momento,
    });

    res.status(201).json({ message: "Item de venda criado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar item de venda
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await itemVendaModel.updateItemVenda(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Item de venda não encontrado" });
    }

    res.json({ message: "Item de venda atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar item de venda
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await itemVendaModel.deleteItemVenda(id);
    if (!deletado) {
      return res.status(404).json({ message: "Item de venda não encontrado" });
    }
    res.json({ message: "Item de venda removido com sucesso" });
  } catch (err) {
    next(err);
  }
};
