import * as model from "../model/solicitacaoModel.js";

export const listar = async (req, res, next) => {
  try {
    const lista = await model.getAll();

    const listaCompleta = await Promise.all(
      lista.map(async (item) => {
        const itens = await model.getItensBySolicitacao(item.solicitacao_id);
        return { ...item, itens };
      })
    );

    res.json(listaCompleta);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    const { loja_id, observacao, itens } = req.body;
    const result = await model.create(loja_id, observacao, itens);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const despachar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await model.despachar(id);
    res.json({ message: "Pedido aprovado e despachado. Em trânsito." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const receber = async (req, res, next) => {
  try {
    const { id } = req.params;
    await model.receber(id);
    res.json({ message: "Mercadoria recebida e adicionada ao estoque." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejeitar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await model.reject(id);
    res.json({ message: "Solicitação rejeitada." });
  } catch (err) {
    next(err);
  }
};
