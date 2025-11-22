import { apiService } from './apiService';

const ENDPOINT = '/lojas';

const normalize = (item) => ({
  id: item.loja_id ?? item.id ?? item._id ?? null,
  loja_id: item.loja_id ?? item.id ?? null,
  nome: item.nome ?? item.nome_fantasia ?? '',
  nome_fantasia: item.nome_fantasia ?? item.nome ?? null,
  razao_social: item.razao_social ?? null,
  cnpj: item.cnpj ?? null,
  endereco: item.endereco ?? null,
  email: item.email ?? null,
  telefone: item.telefone ?? null,
  is_matriz: item.is_matriz ?? item.isMatriz ?? false,
  is_ativo: item.is_ativo ?? item.isAtivo ?? true,
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
    nome: data.nome ?? null,
    nome_fantasia: data.nome_fantasia ?? data.nome ?? null,
    razao_social: data.razao_social ?? null,
    cnpj: data.cnpj ?? null,
    endereco: data.endereco ?? null,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    is_matriz: data.is_matriz ?? data.isMatriz ?? false,
    is_ativo: data.is_ativo ?? data.isAtivo ?? true,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  const safe = ensureNulls({
    nome: data.nome ?? null,
    nome_fantasia: data.nome_fantasia ?? data.nome ?? null,
    razao_social: data.razao_social ?? null,
    cnpj: data.cnpj ?? null,
    endereco: data.endereco ?? null,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    is_matriz: data.is_matriz ?? data.isMatriz ?? null,
    is_ativo: data.is_ativo ?? data.isAtivo ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};
