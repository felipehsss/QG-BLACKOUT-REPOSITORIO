import * as financeiroModel from "../model/financeiroModel.js";

export const listar = async (req, res, next) => {
  try {
    const registros = await financeiroModel.getAll();
    res.json(registros);
  } catch (err) { next(err); }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registro = await financeiroModel.getById(id);
    if (!registro) return res.status(404).json({ message: "Não encontrado" });
    res.json(registro);
  } catch (err) { next(err); }
};

export const listarPorLoja = async (req, res, next) => {
  try {
    const { loja_id } = req.params;
    const registros = await financeiroModel.getByLojaId(loja_id);
    res.json(registros);
  } catch (err) { next(err); }
};

export const criar = async (req, res, next) => {
  try {
    const { loja_id, tipo, categoria_id, origem, referencia_id, descricao, valor, forma_pagamento, data_movimento } = req.body;

    if (!loja_id || !tipo || !valor) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }

    const id = await financeiroModel.createMovimento({
      loja_id,
      tipo, 
      categoria_id: categoria_id || null,
      origem,
      referencia_id: referencia_id ?? null,
      descricao,
      valor,
      forma_pagamento: forma_pagamento || "Outros",
      data_movimento: data_movimento || new Date()
    });

    res.status(201).json({ message: "Movimentação criada com sucesso", id });
  } catch (err) { next(err); }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const linhas = await financeiroModel.updateMovimento(id, req.body);
    if (!linhas) return res.status(404).json({ message: "Não encontrado" });
    res.json({ message: "Atualizado com sucesso" });
  } catch (err) { next(err); }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await financeiroModel.deleteMovimento(id);
    if (!deletado) return res.status(404).json({ message: "Não encontrado" });
    res.json({ message: "Removido com sucesso" });
  } catch (err) { next(err); }
};

// --- RELATÓRIOS ---

export const relatorioKPIs = async (req, res, next) => {
  try {
    const { inicio, fim } = req.query;
    const dados = await financeiroModel.getKPIs(inicio, fim);
    res.json(dados);
  } catch (err) { next(err); }
};

export const relatorioCategorias = async (req, res, next) => {
  try {
    const { tipo, inicio, fim } = req.query; 
    const dados = await financeiroModel.getReportPorCategoria(tipo || "Saída", inicio, fim);
    res.json(dados);
  } catch (err) { next(err); }
};

export const relatorioFormasPagamento = async (req, res, next) => {
  try {
    const { tipo, inicio, fim } = req.query;
    // Padrão 'Entrada' pois geralmente queremos saber como recebemos dinheiro
    const dados = await financeiroModel.getReportFormasPagamento(tipo || "Entrada", inicio, fim);
    res.json(dados);
  } catch (err) { next(err); }
};

export const relatorioAnual = async (req, res, next) => {
  try {
    const { ano } = req.query;
    const dados = await financeiroModel.getReportMensal(ano || new Date().getFullYear());
    res.json(dados);
  } catch (err) { next(err); }
};