import { apiService } from "./apiService";

const ENDPOINT = "/perfis";

const normalize = (item) => ({
  id: item.perfil_id ?? item.id ?? item._id ?? null,
  nome: item.nome ?? "",
  descricao: item.descricao ?? "",
  raw: item,
});

const ensureNulls = (obj) => {
  if (obj == null) return null;
  const out = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v === undefined) out[k] = null;
    else if (typeof v === "object" && v !== null && !Array.isArray(v)) out[k] = ensureNulls(v);
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
    descricao: data.descricao ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

export const update = (id, data, token) => {
  const safe = ensureNulls({
    nome: data.nome ?? null,
    descricao: data.descricao ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};
