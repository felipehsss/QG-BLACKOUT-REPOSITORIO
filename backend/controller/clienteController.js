import * as clienteModel from "../model/clienteModel.js";

export const listar = async (req, res, next) => {
  try {
    const clientes = await clienteModel.getAll();
    res.json(clientes);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await clienteModel.getById(Number(id));
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    const {
      nome,
      telefone,
      email,
      endereco,
      tipo_cliente,
      cpf,
      cnpj,
      razao_social,
      nome_fantasia,
      inscricao_estadual,
    } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "O nome do cliente é obrigatório." });
    }

    const tipo = tipo_cliente === "PJ" ? "PJ" : "PF";

    if (tipo === "PF" && !cpf) {
      return res.status(400).json({ message: "CPF é obrigatório para Pessoa Física." });
    }
    if (tipo === "PJ" && (!cnpj || !razao_social)) {
      return res.status(400).json({ message: "CNPJ e Razão Social são obrigatórios para Pessoa Jurídica." });
    }

    // Verificações de duplicidade
    if (email) {
      const emailExiste = await clienteModel.getByEmail(email);
      if (emailExiste) {
        return res.status(409).json({ message: "E-mail já cadastrado." });
      }
    }
    if (tipo === "PF" && cpf) {
      const cpfExiste = await clienteModel.getByCpf(cpf);
      if (cpfExiste) {
        return res.status(409).json({ message: "CPF já cadastrado." });
      }
    }
    if (tipo === "PJ" && cnpj) {
      const cnpjExiste = await clienteModel.getByCnpj(cnpj);
      if (cnpjExiste) {
        return res.status(409).json({ message: "CNPJ já cadastrado." });
      }
    }

    // Normaliza os dados
    const dadosParaSalvar = {
      nome,
      tipo_cliente: tipo,
      telefone: telefone || null,
      email: email || null,
      endereco: endereco || null,
      cpf: tipo === "PF" ? cpf || null : null,
      cnpj: tipo === "PJ" ? cnpj || null : null,
      razao_social: tipo === "PJ" ? razao_social || null : null,
      nome_fantasia: tipo === "PJ" ? nome_fantasia || null : null,
      inscricao_estadual: tipo === "PJ" ? inscricao_estadual || null : null,
    };

    // Corrigido: chama createCliente em vez de create
    const idInserido = await clienteModel.createCliente(dadosParaSalvar);

    res.status(201).json({ message: "Cliente criado com sucesso", id: idInserido });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicidade detectada." });
    }
    next(err);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dadosCliente = req.body;

    if (!dadosCliente || Object.keys(dadosCliente).length === 0) {
      return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
    }

    const dadosParaAtualizar = {};
    for (const key in dadosCliente) {
      if (dadosCliente[key] !== undefined) {
        dadosParaAtualizar[key] = dadosCliente[key] === "" ? null : dadosCliente[key];
      }
    }

    // Corrigido: chama updateCliente em vez de update
    const linhasAfetadas = await clienteModel.updateCliente(Number(id), dadosParaAtualizar);

    if (linhasAfetadas === 0) {
      const clienteExiste = await clienteModel.getById(Number(id));
      if (!clienteExiste) {
        return res.status(404).json({ message: "Cliente não encontrado." });
      }
      return res.json({ message: "Nenhuma alteração realizada." });
    }

    res.json({ message: "Cliente atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await clienteModel.getById(Number(id));

    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    const deletado = await clienteModel.deleteCliente(Number(id));

    if (!deletado) {
      return res.status(404).json({ message: "Cliente não encontrado ou já excluído." });
    }

    res.json({ message: "Cliente removido com sucesso" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({ message: "Não é possível excluir o cliente pois está associado a vendas." });
    }
    next(err);
  }
};