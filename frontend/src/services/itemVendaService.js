import { apiService } from './apiService';

const ENDPOINT = '/itens-venda';

const normalize = (item) => ({
  id: item.item_venda_id ?? item.id ?? item._id ?? null,
  venda_id: item.venda_id ?? item.vendaId ?? null,
  produto_id: item.produto_id ?? item.produtoId ?? null,
  quantidade: item.quantidade ?? item.qtd ?? item.quantity ?? null,
  preco_unitario: item.preco_unitario ?? item.precoUnitario ?? item.preco ?? null,
  desconto: item.desconto ?? null,
  total: item.total ?? (item.quantidade != null && item.preco_unitario != null ? Number(item.quantidade) * Number(item.preco_unitario) : null),
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

/**
 * Lista todos os itens de venda.
 * GET /itens-venda
 */
export const readAll = async (token) => {
  const res = await apiService.get(ENDPOINT, token);
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return arr.map(normalize);
};

/**
 * Busca um item pelo ID.
 * GET /itens-venda/:id
 */
export const readById = async (id, token) => {
  const res = await apiService.get(`${ENDPOINT}/${id}`, token);
  const item = Array.isArray(res) ? res[0] : res?.data ?? res;
  return item ? normalize(item) : null;
};

/**
 * Cria um item de venda (single).
 * POST /itens-venda
 */
export const create = (data, token) => {
  const safe = ensureNulls({
    venda_id: data.venda_id ?? data.vendaId ?? null,
    produto_id: data.produto_id ?? data.produtoId ?? null,
    quantidade: data.quantidade ?? data.qtd ?? data.quantity ?? null,
    preco_unitario: data.preco_unitario ?? data.precoUnitario ?? data.preco ?? null,
    desconto: data.desconto ?? null,
    total: data.total ?? null,
  });
  return apiService.post(ENDPOINT, safe, token);
};

/**
 * Cria múltiplos itens de venda (bulk).
 * POST /itens-venda (array)
 * Observação: backend precisa suportar receber array; se não suportar, remova este helper.
 */
export const createMany = (items, token) => {
  const safeItems = Array.isArray(items)
    ? items.map((data) =>
        ensureNulls({
          venda_id: data.venda_id ?? data.vendaId ?? null,
          produto_id: data.produto_id ?? data.produtoId ?? null,
          quantidade: data.quantidade ?? data.qtd ?? data.quantity ?? null,
          preco_unitario: data.preco_unitario ?? data.precoUnitario ?? data.preco ?? null,
          desconto: data.desconto ?? null,
          total: data.total ?? null,
        })
      )
    : [];
  return apiService.post(ENDPOINT, safeItems, token);
};

/**
 * Atualiza um item pelo ID.
 * PUT /itens-venda/:id
 */
export const update = (id, data, token) => {
  const safe = ensureNulls({
    venda_id: data.venda_id ?? data.vendaId ?? null,
    produto_id: data.produto_id ?? data.produtoId ?? null,
    quantidade: data.quantidade ?? data.qtd ?? data.quantity ?? null,
    preco_unitario: data.preco_unitario ?? data.precoUnitario ?? data.preco ?? null,
    desconto: data.desconto ?? null,
    total: data.total ?? null,
  });
  return apiService.put(`${ENDPOINT}/${id}`, safe, token);
};

/**
 * Deleta um item pelo ID.
 * DELETE /itens-venda/:id
 */
export const deleteRecord = (id, token) => {
  return apiService.delete(`${ENDPOINT}/${id}`, token);
};

/**
 * Busca itens pelo ID da Venda.
 * GET /itens-venda/venda/:venda_id
 */
export const readByVendaId = async (vendaId, token) => {
  const res = await apiService.get(`${ENDPOINT}/venda/${vendaId}`, token);
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return arr.map(normalize);
};
