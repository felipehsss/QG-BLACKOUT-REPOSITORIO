// backend/controller/estoqueController.js
import * as estoqueModel from "../model/estoqueModel.js";

// Listar todo o estoque (com nomes)
export const listar = async (req, res, next) => {
  try {
    const estoque = await estoqueModel.getAll();
    res.json(estoque);
  } catch (err) {
    next(err);
  }
};

// Buscar por ID do registro de estoque
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await estoqueModel.getById(id);
    if (!item) {
      return res.status(404).json({ message: "Item de estoque não encontrado" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Buscar estoque por ID do Produto e ID da Loja
export const buscarPorProdutoLoja = async (req, res, next) => {
  try {
    const { produtoId, lojaId } = req.params;
    const item = await estoqueModel.getByProdutoELoja(produtoId, lojaId);
    if (!item) {
      // Retorna 0 se não houver registro, o que é esperado
      return res.json({ produto_id: produtoId, loja_id: lojaId, quantidade: 0 });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// Dar entrada no estoque (Adicionar ou Somar)
export const darEntrada = async (req, res, next) => {
  try {
    const { produto_id, loja_id, quantidade } = req.body;

    if (!produto_id || !loja_id || !quantidade) {
      return res.status(400).json({ 
        message: "Campos obrigatórios: produto_id, loja_id, quantidade" 
      });
    }

    const result = await estoqueModel.createOrUpdate({ 
      produto_id, 
      loja_id, 
      // Garante que a quantidade é um número
      quantidade: Number(quantidade) 
    });
    
    res.status(201).json({ message: "Estoque atualizado com sucesso", result });
  } catch (err) {
    next(err);
  }
};

// Atualizar/Ajustar estoque manualmente (seta um valor específico)
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body; 

    if (quantidade === undefined) {
      return res.status(400).json({ message: "Campo obrigatório: quantidade" });
    }

    const linhas = await estoqueModel.updateEstoque(id, { 
      quantidade: Number(quantidade) 
    });
    
    if (!linhas) {
      return res.status(404).json({ message: "Item de estoque não encontrado" });
    }
    res.json({ message: "Estoque ajustado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar item de estoque (raro, mas completa o CRUD)
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await estoqueModel.deleteEstoque(id);
    if (!deletado) {
      return res.status(404).json({ message: "Item de estoque não encontrado" });
    }
    res.json({ message: "Item de estoque removido com sucesso" });
  } catch (err) {
    next(err);
  }
};