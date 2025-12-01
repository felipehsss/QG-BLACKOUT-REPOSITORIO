import * as financeiroModel from "../model/financeiroModel.js";

// ... listar, buscarPorId, listarPorLoja permanecem iguais ...
export const listar = async (req, res, next) => {
  try {
    const registros = await financeiroModel.getAll();
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => { /* ... igual ... */ };
export const listarPorLoja = async (req, res, next) => { /* ... igual ... */ };

// Criar manual (Atualizado com categoria e forma de pagamento)
export const criar = async (req, res, next) => {
  try {
    const { loja_id, tipo, categoria_id, origem, referencia_id, descricao, valor, forma_pagamento, data_movimento } = req.body;

    if (!loja_id || !tipo || !valor) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }

    const id = await financeiroModel.createMovimento({
      loja_id,
      tipo, // 'Entrada' ou 'Saída'
      categoria_id: categoria_id || null,
      origem,
      referencia_id: referencia_id ?? null,
      descricao,
      valor,
      forma_pagamento: forma_pagamento || "Outros",
      data_movimento: data_movimento || new Date()
    });

    res.status(201).json({ message: "Movimentação criada com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// ... atualizar e deletar permanecem iguais ... 
export const atualizar = async (req, res, next) => { /* ... igual ... */ };
export const deletar = async (req, res, next) => { /* ... igual ... */ };

// --- NOVOS ENDPOINTS DE RELATÓRIO ---

export const relatorioKPIs = async (req, res, next) => {
  try {
    const { inicio, fim } = req.query;
    if(!inicio || !fim) return res.status(400).json({message: "Informe data inicio e fim"});
    
    const dados = await financeiroModel.getKPIs(inicio, fim);
    res.json(dados);
  } catch (err) { next(err); }
};

export const relatorioCategorias = async (req, res, next) => {
  try {
    const { tipo, inicio, fim } = req.query; // tipo = 'Entrada' ou 'Saída'
    const dados = await financeiroModel.getReportPorCategoria(tipo || "Saída", inicio, fim);
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