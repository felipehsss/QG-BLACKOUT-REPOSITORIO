// vendaController.js
import * as vendaModel from "../model/vendaModel.js";

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

// Criar nova venda
export const criar = async (req, res, next) => {
  try {
    const { loja_id, sessao_id, funcionario_id, valor_total, status_venda } = req.body;

    if (!loja_id || !sessao_id || !funcionario_id || !valor_total) {
      return res.status(400).json({
        message:
          "Campos obrigatórios: loja_id, sessao_id, funcionario_id e valor_total",
      });
    }

    const id = await vendaModel.createVenda({
      loja_id,
      sessao_id,
      funcionario_id,
      valor_total,
      status_venda: status_venda ?? "Concluída",
    });

    res.status(201).json({ message: "Venda registrada com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar venda existente (ex: cancelar venda)
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
