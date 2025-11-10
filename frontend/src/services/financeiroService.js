import { apiService } from './apiService';

const ENDPOINT = '/financeiro';

const normalize = (item) => ({
  id: item.financeiro_id ?? item.id ?? item._id ?? null,
  loja_id: item.loja_id ?? null,
  tipo: item.tipo ?? null, // 'Entrada' | 'Saída'
  origem: item.origem ?? null, // 'Venda' | 'Conta a Pagar' | 'Outro'
  referencia_id: item.referencia_id ?? item.referenciaId ?? null,
  descricao: item.descricao ?? null,
  valor: item.valor ?? null,
  data_movimento: item.data_movimento ?? item.dataMovimento ?? null,
  raw: item,
});

const ensureNulls = (obj) => {
  if (obj == null) return null;
  const out = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v === undefined) out[k] = null;
    else if (typeof v === 'object' && v !== null && !Array.isArray(v)) out[k] = ensureNulls(v);
    else out[k] = v;
  });
  return out;
};

export const readAll = async (token) => {
  const res = await apiService.get(ENDPOINT, token);
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return arr.map(normalize);
};

export const readById = async (id, token) => {
  const res = await apiService.get(`${ENDPOINT}/${id}`, token);
  const item = Array.isArray(res) ? res[0] : res?.data ?? res;
  return item ? normalize(item) : null;
};

export const create = (data, token) => {
  const safe = ensureNulls({
    loja_id: data.loja_id ?? null,
    tipo: data.tipo ?? null,
    origem: data.origem ?? null,
    referencia_id: data.referencia_id ?? data.referenciaId ?? null,
    descricao: data.descricao ?? null,
    valor: data.valor ?? null,
    data_movimento: data.data_movimento ?? data.dataMovimento ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  const safe = ensureNulls({
    loja_id: data.loja_id ?? null,
    tipo: data.tipo ?? null,
    origem: data.origem ?? null,
    referencia_id: data.referencia_id ?? data.referenciaId ?? null,
    descricao: data.descricao ?? null,
    valor: data.valor ?? null,
    data_movimento: data.data_movimento ?? data.dataMovimento ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};

/**
 * Relatórios / endpoints específicos
 */

/**
 * Busca o relatório de fluxo de caixa.
 * Rota: GET /financeiro/fluxo-caixa
 */
export const getFluxoCaixa = async (token) => {
  const res = await apiService.get(`${ENDPOINT}/fluxo-caixa`, token);
  return Array.isArray(res) ? res.map(normalize) : res?.data ?? res;
};

/**
 * Busca o relatório de despesas por categoria.
 * Rota: GET /financeiro/despesas-por-categoria
 */
export const getDespesasPorCategoria = async (token) => {
  const res = await apiService.get(`${ENDPOINT}/despesas-por-categoria`, token);
  return Array.isArray(res) ? res : res?.data ?? res;
};

/**
 * Busca o total de vendas dos últimos 30 dias.
 * Rota: GET /financeiro/total-vendas-ultimos-30-dias
 */
export const getTotalVendasUltimos30Dias = async (token) => {
  const res = await apiService.get(`${ENDPOINT}/total-vendas-ultimos-30-dias`, token);
  return res?.data ?? res;
};
