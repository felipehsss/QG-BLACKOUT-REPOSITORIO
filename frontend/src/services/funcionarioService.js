import { apiService } from './apiService';

const ENDPOINT = '/funcionarios';

const normalize = (item) => ({
  id: item.funcionario_id ?? item.id ?? item._id ?? null,
  loja_id: item.loja_id ?? null,
  perfil_id: item.perfil_id ?? null,
  nome_completo: item.nome_completo ?? item.nome ?? item.fullName ?? '',
  cpf: item.cpf ?? null,
  email: item.email ?? null,
  telefone_contato: item.telefone_contato ?? item.telefone ?? null,
  is_ativo: typeof item.is_ativo === 'boolean' ? item.is_ativo : (item.is_ativo === 0 || item.is_ativo === '0' ? false : (item.is_ativo === 1 || item.is_ativo === '1' ? true : null)),
  data_admissao: item.data_admissao ?? item.dataAdmissao ?? null,
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
    perfil_id: data.perfil_id ?? null,
    nome_completo: data.nome_completo ?? data.nome ?? null,
    cpf: data.cpf ?? null,
    email: data.email ?? null,
    // senha_hash geralmente é tratado no backend; se precisar enviar plain password,
    // envie como 'senha' e o backend deve gerar o hash. Aqui deixamos campo opcional.
    senha_hash: data.senha_hash ?? data.senha ?? null,
    telefone_contato: data.telefone_contato ?? data.telefone ?? null,
    is_ativo: data.is_ativo ?? null,
    data_admissao: data.data_admissao ?? data.dataAdmissao ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  const safe = ensureNulls({
    loja_id: data.loja_id ?? null,
    perfil_id: data.perfil_id ?? null,
    nome_completo: data.nome_completo ?? data.nome ?? null,
    cpf: data.cpf ?? null,
    email: data.email ?? null,
    // Para atualização de senha, usar senha_hash ou endpoint específico
    senha_hash: data.senha_hash ?? data.senha ?? undefined,
    telefone_contato: data.telefone_contato ?? data.telefone ?? null,
    is_ativo: data.is_ativo ?? null,
    data_admissao: data.data_admissao ?? data.dataAdmissao ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};
