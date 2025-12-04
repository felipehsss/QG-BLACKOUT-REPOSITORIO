// backend/controller/fornecedorController.js
import * as fornecedorModel from "../model/fornecedorModel.js";
import * as contaPagarModel from "../model/contaPagarModel.js";
import { getConnection } from "../config/database.js";

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
    // Aqui você já estava filtrando corretamente, por isso criar funcionava
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

// Atualizar fornecedor existente (CORRIGIDO)
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ANTES: const dados = req.body; 
    // (Isso causava o erro pois pegava 'endereco' que não existe no banco)

    // DEPOIS: Pegamos apenas os campos permitidos
    const { razao_social, cnpj, contato_principal, email, telefone } = req.body;

    // Montamos o objeto apenas com o que existe no banco
    const dadosParaAtualizar = {};
    if (razao_social !== undefined) dadosParaAtualizar.razao_social = razao_social;
    if (cnpj !== undefined) dadosParaAtualizar.cnpj = cnpj;
    if (contato_principal !== undefined) dadosParaAtualizar.contato_principal = contato_principal;
    if (email !== undefined) dadosParaAtualizar.email = email;
    if (telefone !== undefined) dadosParaAtualizar.telefone = telefone;

    // Se o objeto estiver vazio, não fazemos nada para evitar erro de SQL vazio
    if (Object.keys(dadosParaAtualizar).length === 0) {
        return res.status(400).json({ message: "Nenhum dado válido enviado para atualização." });
    }

    const linhas = await fornecedorModel.updateFornecedor(id, dadosParaAtualizar);
    
    // Nota: update retorna número de linhas afetadas. Se os dados forem iguais, pode retornar 0.
    // Mas se o ID não existir, também pode ser tratado. Vamos assumir sucesso se não der erro.
    
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
    const [produtos] = await connection.execute(
      "SELECT * FROM produtos WHERE fornecedor_id = ?",
      [id]
    );

    // 3. Busca Contas a Pagar deste fornecedor
    const contasRaw = await contaPagarModel.getByFornecedorId(id);
    const contas = Array.isArray(contasRaw) ? contasRaw : (contasRaw?.data || []);

    // 4. Calcula Totais
    const totalDivida = contas
      .filter(c => c.status !== "Pago")
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