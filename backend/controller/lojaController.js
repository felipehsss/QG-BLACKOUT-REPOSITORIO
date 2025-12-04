import { 
  getAll, 
  getById, 
  createLoja, 
  updateLoja, 
  deleteLoja 
} from "../model/lojaModel.js";

// Listar todas as lojas
export const listar = async (req, res, next) => {
  try {
    const lojas = await getAll(); // Chamada direta
    res.json(lojas);
  } catch (err) {
    next(err);
  }
};

// Buscar loja por ID
export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loja = await getById(id);
    if (!loja) {
      return res.status(404).json({ message: "Loja não encontrada" });
    }
    res.json(loja);
  } catch (err) {
    next(err);
  }
};

// Criar nova loja
export const criar = async (req, res, next) => {
  try {
    // Pegamos nome OU nome_fantasia para flexibilidade
    const { nome, nome_fantasia, cnpj, endereco, telefone, tipo, is_ativo } = req.body;
    const nomeFinal = nome || nome_fantasia;

    if (!nomeFinal) {
      return res.status(400).json({ message: "Nome da loja é obrigatório" });
    }

    const id = await createLoja({
      nome: nomeFinal,
      cnpj: cnpj || null,
      endereco: endereco || null,
      telefone: telefone || null,
      // Se não vier 'tipo', assume Filial. Se não vier 'is_ativo', assume true (1)
      tipo: tipo || "Filial",
      is_ativo: is_ativo !== undefined ? (is_ativo ? 1 : 0) : 1,
    });

    res.status(201).json({ message: "Loja criada com sucesso", id });
  } catch (err) {
    next(err);
  }
};

// Atualizar loja existente
export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, nome_fantasia, cnpj, endereco, telefone, tipo, is_ativo } = req.body;

    // Monta objeto apenas com dados enviados
    const dados = {};
    if (nome || nome_fantasia) dados.nome = nome || nome_fantasia;
    if (cnpj !== undefined) dados.cnpj = cnpj;
    if (endereco !== undefined) dados.endereco = endereco;
    if (telefone !== undefined) dados.telefone = telefone;
    if (tipo !== undefined) dados.tipo = tipo;
    if (is_ativo !== undefined) dados.is_ativo = (String(is_ativo) === "true" || is_ativo === true) ? 1 : 0;

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({ message: "Nenhum dado para atualizar." });
    }

    const linhas = await updateLoja(id, dados);
    
    // update retorna linhas afetadas, mas em alguns drivers se nada mudou retorna 0.
    // Vamos assumir sucesso se não der erro.
    res.json({ message: "Loja atualizada com sucesso" });
  } catch (err) {
    next(err);
  }
};

// Deletar loja
export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteLoja(id);
    res.json({ message: "Loja removida com sucesso" });
  } catch (err) {
    next(err);
  }
};