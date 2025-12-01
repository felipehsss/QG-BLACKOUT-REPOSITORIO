import { apiService } from './apiService';

const ENDPOINT = '/clientes';

const normalize = (item) => ({
  id: item.id_cliente ?? item.id ?? item._id ?? null,
  nome: item.nome ?? item.nome_fantasia ?? item.razao_social ?? '',
  telefone: item.telefone ?? null,
  email: item.email ?? null,
  endereco: item.endereco ?? null,
  data_cadastro: item.data_cadastro ?? null,
  tipo_cliente: item.tipo_cliente ?? null, // 'PF' ou 'PJ'
  cpf: item.cpf ?? null,
  cnpj: item.cnpj ?? null,
  razao_social: item.razao_social ?? null,
  nome_fantasia: item.nome_fantasia ?? null,
  inscricao_estadual: item.inscricao_estadual ?? null,
  foto: item.foto ?? null, // Adicionado para retornar a foto se existir
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
  // CORREÇÃO: Se for FormData, passa direto para a API
  if (data instanceof FormData) {
    return apiService.post(ENDPOINT, data, token);
  }

  // Se for JSON normal, faz o tratamento de nulos
  const safe = ensureNulls({
    nome: data.nome ?? null,
    telefone: data.telefone ?? null,
    email: data.email ?? null,
    endereco: data.endereco ?? null,
    tipo_cliente: data.tipo_cliente ?? 'PF',
    cpf: data.cpf ?? null,
    cnpj: data.cnpj ?? null,
    razao_social: data.razao_social ?? null,
    nome_fantasia: data.nome_fantasia ?? null,
    inscricao_estadual: data.inscricao_estadual ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  // CORREÇÃO: Se for FormData, passa direto para a API
  if (data instanceof FormData) {
    return apiService.put(`${ENDPOINT}/${id}`, data, token);
  }

  // Se for JSON normal, faz o tratamento de nulos
  const safe = ensureNulls({
    nome: data.nome ?? null,
    telefone: data.telefone ?? null,
    email: data.email ?? null,
    endereco: data.endereco ?? null,
    tipo_cliente: data.tipo_cliente ?? null,
    cpf: data.cpf ?? null,
    cnpj: data.cnpj ?? null,
    razao_social: data.razao_social ?? null,
    nome_fantasia: data.nome_fantasia ?? null,
    inscricao_estadual: data.inscricao_estadual ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};