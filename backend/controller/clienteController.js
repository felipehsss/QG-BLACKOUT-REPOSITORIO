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
    const cliente = await clienteModel.getById(id);
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
    const dadosCliente = req.body;

    if (!dadosCliente.nome) {
      return res.status(400).json({ message: "O nome do cliente é obrigatório." });
    }
    const tipo = dadosCliente.tipo_cliente || "PF";
    if (tipo === "PF" && !dadosCliente.cpf) {
      return res.status(400).json({ message: "CPF é obrigatório para Pessoa Física." });
    }
    if (tipo === "PJ" && !dadosCliente.cnpj) {
      return res.status(400).json({ message: "CNPJ é obrigatório para Pessoa Jurídica." });
    }
    if (tipo === "PJ" && !dadosCliente.razao_social) {
      return res.status(400).json({ message: "Razão Social é obrigatória para Pessoa Jurídica." });
    }

    if (dadosCliente.email) {
      const emailExiste = await clienteModel.getByEmail(dadosCliente.email);
      if (emailExiste) {
        return res.status(409).json({ message: "E-mail já cadastrado para outro cliente." });
      }
    }
    if (tipo === "PF" && dadosCliente.cpf) {
      const cpfExiste = await clienteModel.getByCpf(dadosCliente.cpf);
      if (cpfExiste) {
        return res.status(409).json({ message: "CPF já cadastrado para outro cliente." });
      }
    }
    if (tipo === "PJ" && dadosCliente.cnpj) {
      const cnpjExiste = await clienteModel.getByCnpj(dadosCliente.cnpj);
      if (cnpjExiste) {
        return res.status(409).json({ message: "CNPJ já cadastrado para outro cliente." });
      }
    }

    const resultado = await clienteModel.createCliente(dadosCliente);
    const idInserido = resultado?.insertId || resultado?.id_cliente || resultado;

    if (!idInserido) {
      throw new Error("Falha ao criar o cliente, ID não retornado.");
    }

    res.status(201).json({ message: "Cliente criado com sucesso", id: idInserido });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      let campo = "desconhecido";
      if (err.message.includes("cpf")) campo = "CPF";
      else if (err.message.includes("cnpj")) campo = "CNPJ";
      else if (err.message.includes("email")) campo = "E-mail";
      return res.status(409).json({ message: `Erro ao criar cliente: ${campo} já cadastrado.` });
    }
    next(err);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dadosCliente = req.body;

    if (Object.keys(dadosCliente).length === 0) {
      return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
    }

    if (dadosCliente.email) {
      const outroCliente = await clienteModel.getByEmail(dadosCliente.email);
      if (outroCliente && outroCliente.id_cliente !== parseInt(id, 10)) {
        return res.status(409).json({ message: "E-mail já cadastrado para outro cliente." });
      }
    }
    if (dadosCliente.cpf && (!dadosCliente.tipo_cliente || dadosCliente.tipo_cliente === "PF")) {
      const outroCliente = await clienteModel.getByCpf(dadosCliente.cpf);
      if (outroCliente && outroCliente.id_cliente !== parseInt(id, 10)) {
        return res.status(409).json({ message: "CPF já cadastrado para outro cliente." });
      }
    }
    if (dadosCliente.cnpj && dadosCliente.tipo_cliente === "PJ") {
      const outroCliente = await clienteModel.getByCnpj(dadosCliente.cnpj);
      if (outroCliente && outroCliente.id_cliente !== parseInt(id, 10)) {
        return res.status(409).json({ message: "CNPJ já cadastrado para outro cliente." });
      }
    }

    const linhasAfetadas = await clienteModel.updateCliente(id, dadosCliente);

    if (linhasAfetadas === 0) {
      const clienteExiste = await clienteModel.getById(id);
      if (!clienteExiste) {
        return res.status(404).json({ message: "Cliente não encontrado para atualização" });
      } else {
        return res.json({ message: "Nenhuma alteração detectada nos dados do cliente." });
      }
    }

    res.json({ message: "Cliente atualizado com sucesso" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      let campo = "desconhecido";
      if (err.message.includes("cpf")) campo = "CPF";
      else if (err.message.includes("cnpj")) campo = "CNPJ";
      else if (err.message.includes("email")) campo = "E-mail";
      return res.status(409).json({ message: `Erro ao atualizar cliente: ${campo} já pertence a outro cadastro.` });
    }
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cliente = await clienteModel.getById(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado para exclusão." });
    }

    const deletado = await clienteModel.deleteCliente(id);

    if (!deletado) {
      return res.status(404).json({ message: "Cliente não encontrado ou já excluído." });
    }

    res.json({ message: "Cliente removido com sucesso" });

  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || (err.message && err.message.includes("foreign key constraint fails"))) {
      return res.status(400).json({ message: "Não é possível excluir o cliente pois ele está associado a uma ou mais vendas." });
    }
    next(err);
  }
};