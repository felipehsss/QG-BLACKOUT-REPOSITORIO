import * as produtoModel from "../model/produtoModel.js";

export const listar = async (req, res, next) => {
  try {
    const produtos = await produtoModel.getAll();
    res.json(produtos);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produto = await produtoModel.getById(id);
    if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    // Desestrutura os novos campos (modelo, ano) junto com os antigos
    const { 
      sku, 
      nome, 
      descricao, 
      preco_custo, 
      preco_venda, 
      marca, 
      modelo, 
      ano, 
      categoria, 
      fornecedor_id 
    } = req.body;

    // Validação básica
    if (!sku || !nome || !preco_venda) {
      return res.status(400).json({ message: "Campos obrigatórios: sku, nome e preco_venda" });
    }

    const dadosProduto = {
      sku,
      nome,
      descricao,
      marca: marca || null,
      modelo: modelo || null, // Novo campo
      ano: ano || null,       // Novo campo
      categoria: categoria || null,
      fornecedor_id: fornecedor_id ? Number(fornecedor_id) : null,
      preco_custo: preco_custo ? parseFloat(preco_custo) : 0.00,
      preco_venda: parseFloat(preco_venda),
      foto: req.file ? req.file.filename : null
    };

    const id = await produtoModel.createProduto(dadosProduto);
    res.status(201).json({ message: "Produto criado com sucesso", id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "SKU já cadastrado." });
    next(err);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Pega todos os campos enviados no corpo da requisição
    const dados = { ...req.body };

    // Se houver nova foto, atualiza o campo foto
    if (req.file) dados.foto = req.file.filename;

    // Tratamento de números para garantir o formato correto no BD
    if (dados.preco_custo) dados.preco_custo = parseFloat(dados.preco_custo);
    if (dados.preco_venda) dados.preco_venda = parseFloat(dados.preco_venda);
    if (dados.fornecedor_id) dados.fornecedor_id = Number(dados.fornecedor_id);

    // Limpeza de campos vazios para null (opcional, mas recomendável para consistência)
    if (dados.marca === "") dados.marca = null;
    if (dados.modelo === "") dados.modelo = null;
    if (dados.ano === "") dados.ano = null;
    if (dados.categoria === "") dados.categoria = null;

    const linhas = await produtoModel.updateProduto(id, dados);
    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await produtoModel.deleteProduto(id);
    res.json({ message: "Produto removido" });
  } catch (err) {
    next(err);
  }
};