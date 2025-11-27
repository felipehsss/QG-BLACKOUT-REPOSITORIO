// fornecedorController.js
import * as fornecedorModel from "../model/fornecedorModel.js";
import * as contaPagarModel from "../model/contaPagarModel.js"; // Importe o model de contas
import { getConnection } from "../config/database.js"; // Necessário para query manual de produtos
// Listar todos os fornecedores
export const listar = async (req, res, next) => {
  try {
    const fornecedores = await fornecedorModel.getAll();
    res.json(fornecedores);
  } catch (err) {
    next(err);
  }
};

// Buscar fornecedor por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fornecedor = await fornecedorModel.getById(id);
    if (!fornecedor) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    res.json(fornecedor);
  } catch (err) {
    next(err);
  }
};

// Criar novo fornecedor
export const criar = async (req, res, next) => {
  try {
    const { razao_social, cnpj, contato_principal, email, telefone } = req.body;

    if (!razao_social || !cnpj) {
      return res
        .status(400)
        .json({ message: "Campos obrigatórios: razão social e CNPJ" });
    }

    const id = await fornecedorModel.createFornecedor({
      razao_social,
      cnpj,
      contato_principal,
      email,
      telefone,
    });

    res.status(201).json({ message: "Fornecedor criado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar fornecedor existente
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const linhas = await fornecedorModel.updateFornecedor(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }

    res.json({ message: "Fornecedor atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar fornecedor
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await fornecedorModel.deleteFornecedor(id);
    if (!deletado) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    res.json({ message: "Fornecedor removido com sucesso" });
  } catch (err) {
    next(err);
  }
};

export const obterRelatorio = async (req, res, next) => {
  const connection = await getConnection();
  try {
    const { id } = req.params;

    // 1. Busca dados do Fornecedor
    const fornecedor = await fornecedorModel.getById(id);
    if (!fornecedor) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }

    // 2. Busca Produtos vinculados a este fornecedor
    // (Assumindo que existe fornecedor_id na tabela produtos ou uma tabela pivo)
    const [produtos] = await connection.execute(
      "SELECT * FROM produtos WHERE fornecedor_id = ?",
      [id]
    );

    // 3. Busca Contas a Pagar deste fornecedor
    // Nota: Se getByFornecedorId retornar array direto ou [rows], ajuste conforme seu db.read
    const contasRaw = await contaPagarModel.getByFornecedorId(id);
    const contas = Array.isArray(contasRaw) ? contasRaw : (contasRaw?.data || []);

    // 4. Calcula Totais
    const totalDivida = contas
      .filter(c => c.status !== "Pago") // Exemplo de filtro
      .reduce((acc, curr) => acc + Number(curr.valor), 0);

    const totalPago = contas
      .filter(c => c.status === "Pago")
      .reduce((acc, curr) => acc + Number(curr.valor), 0);

    res.json({
      fornecedor,
      produtos: produtos || [],
      financeiro: {
        contas: contas || [],
        total_divida: totalDivida,
        total_pago: totalPago,
        total_geral: totalDivida + totalPago
      }
    });

  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
};