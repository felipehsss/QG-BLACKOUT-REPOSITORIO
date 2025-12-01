// backend/controller/compraController.js
import * as model from "../model/compraModel.js";

// LISTAR PEDIDOS DE COMPRA
export const listar = async (req, res, next) => {
  try {
    const lista = await model.getAll();

    // Adiciona itens para cada pedido
    const completos = await Promise.all(
      lista.map(async (pedido) => {
        const itens = await model.getItens(pedido.pedido_compra_id);
        return { ...pedido, itens };
      })
    );

    res.json(completos);
  } catch (err) {
    next(err);
  }
};

// CRIAR NOVO PEDIDO
export const criar = async (req, res, next) => {
  try {
    // Espera formato:
    // {
    //   fornecedor_id,
    //   loja_id,
    //   observacao,
    //   total,
    //   itens: [{ produto_id, quantidade, custo }]
    // }
    const result = await model.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// RECEBER PEDIDO (DAR ENTRADA NO ESTOQUE + CRIAR CONTA A PAGAR)
export const receber = async (req, res, next) => {
  try {
    const { id } = req.params;

    await model.receberPedido(id);

    res.json({
      message: "Mercadoria recebida, estoque atualizado e conta a pagar gerada!"
    });
  } catch (err) {
    next(err);
  }
};
