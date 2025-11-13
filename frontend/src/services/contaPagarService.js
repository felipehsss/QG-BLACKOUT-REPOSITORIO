import { apiService } from './apiService';

const ENDPOINT = '/contas_a_pagar';

const normalize = (item) => ({
  id: item.conta_pagar_id ?? item.id ?? item._id ?? null,
  loja_id: item.loja_id ?? null,
  fornecedor_id: item.fornecedor_id ?? item.fornecedorId ?? null,
  descricao: item.descricao ?? null,
  valor: item.valor ?? null,
  data_vencimento: item.data_vencimento ?? item.dataVencimento ?? null,
  data_pagamento: item.data_pagamento ?? item.dataPagamento ?? null,
  categoria: item.categoria ?? null,
  status: item.status ?? null,
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
    fornecedor_id: data.fornecedor_id ?? data.fornecedorId ?? null,
    descricao: data.descricao ?? null,
    valor: data.valor ?? null,
    data_vencimento: data.data_vencimento ?? data.dataVencimento ?? null,
    data_pagamento: data.data_pagamento ?? data.dataPagamento ?? null,
    categoria: data.categoria ?? null,
    status: data.status ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  const safe = ensureNulls({
    loja_id: data.loja_id ?? null,
    fornecedor_id: data.fornecedor_id ?? data.fornecedorId ?? null,
    descricao: data.descricao ?? null,
    valor: data.valor ?? null,
    data_vencimento: data.data_vencimento ?? data.dataVencimento ?? null,
    data_pagamento: data.data_pagamento ?? data.dataPagamento ?? null,
    categoria: data.categoria ?? null,
    status: data.status ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};

/**
 * Busca contas a pagar por ID do fornecedor.
 * Rota: GET /contas_a_pagar/fornecedor/:id
 */
export const readByFornecedorId = async (fornecedorId, token) => {
  const res = await apiService.get(`${ENDPOINT}/fornecedor/${fornecedorId}`, token);
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return arr.map(normalize);
};
