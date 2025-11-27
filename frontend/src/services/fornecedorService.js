import { apiService } from './apiService';

const ENDPOINT = '/fornecedores';

const normalize = (item) => ({
  id: item.fornecedor_id ?? item.id ?? item._id ?? null,
  nome: item.razao_social ?? item.nome ?? '',
  cnpj: item.cnpj ?? null,
  contato_principal: item.contato_principal ?? null,
  email: item.email ?? null,
  telefone: item.telefone ?? null,
  endereco: item.endereco ?? null, // <- agora incluído
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
    razao_social: data.razao_social ?? data.nome ?? null,
    cnpj: data.cnpj ?? null,
    contato_principal: data.contato_principal ?? null,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    endereco: data.endereco ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  const safe = ensureNulls({
    razao_social: data.razao_social ?? data.nome ?? null,
    cnpj: data.cnpj ?? null,
    contato_principal: data.contato_principal ?? null,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    endereco: data.endereco ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};
export const getRelatorio = (id, token) => {
  return apiService.get(`${ENDPOINT}/${id}/relatorio`, token);
};