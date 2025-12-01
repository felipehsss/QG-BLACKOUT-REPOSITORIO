import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as funcionarioModel from "../model/funcionarioModel.js";

const SECRET = process.env.JWT_SECRET || "chaveSecreta123";

export const listar = async (req, res, next) => {
  try {
    const funcionarios = await funcionarioModel.getAll();
    res.json(funcionarios);
  } catch (err) {
    next(err);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const funcionario = await funcionarioModel.getById(id);
    if (!funcionario) {
      return res.status(404).json({ message: "Funcionário não encontrado" });
    }
    res.json(funcionario);
  } catch (err) {
    next(err);
  }
};

export const criar = async (req, res, next) => {
  try {
    const { 
      nome_completo, 
      email, 
      cpf, 
      senha, 
      telefone_contato, 
      data_admissao, 
      loja_id, 
      perfil_id,
      salario // <--- Novo campo
    } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
    }

    const jaExiste = await funcionarioModel.getByEmail(email);
    if (jaExiste) {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const novoFuncionario = {
      nome_completo,
      email,
      cpf: cpf || null,
      telefone_contato: telefone_contato || null,
      data_admissao: data_admissao || null,
      // Conversão de Strings para Números (necessário com FormData)
      loja_id: Number(loja_id),
      perfil_id: Number(perfil_id),
      senha_hash,
      is_ativo: 1, // Padrão ativo ao criar
      foto: req.file ? req.file.filename : null,
      salario: salario ? parseFloat(salario) : null // <--- Tratamento do salário
    };

    const id = await funcionarioModel.createFuncionario(novoFuncionario);
    res.status(201).json({ message: "Funcionário criado com sucesso", id });
  } catch (err) {
    next(err);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dados = { ...req.body };

    // Se enviou foto nova
    if (req.file) {
      dados.foto = req.file.filename;
    }

    // Tratamento da senha (se enviada)
    if (dados.senha) {
      dados.senha_hash = await bcrypt.hash(dados.senha, 10);
      delete dados.senha;
    }

    // Tratamento de números e booleanos que vêm como string no FormData
    if (dados.loja_id) dados.loja_id = Number(dados.loja_id);
    if (dados.perfil_id) dados.perfil_id = Number(dados.perfil_id);

    // Checkbox no HTML envia "true" string ou nada
    if (dados.is_ativo !== undefined) {
      dados.is_ativo = String(dados.is_ativo) === "true" || dados.is_ativo === true ? 1 : 0;
    }

    // Tratamento do salário na atualização
    if (dados.salario !== undefined) {
      dados.salario = dados.salario ? parseFloat(dados.salario) : null;
    }

    const linhas = await funcionarioModel.updateFuncionario(id, dados);
    if (!linhas) {
      return res.status(404).json({ message: "Funcionário não encontrado" });
    }

    res.json({ message: "Funcionário atualizado com sucesso" });
  } catch (err) {
    next(err);
  }
};

export const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletado = await funcionarioModel.deleteFuncionario(id);
    if (!deletado) {
      return res.status(404).json({ message: "Funcionário não encontrado" });
    }
    res.json({ message: "Funcionário removido com sucesso" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const funcionario = await funcionarioModel.getByEmail(email);
    if (!funcionario) return res.status(401).json({ message: "Credenciais inválidas" });

    const senhaValida = await bcrypt.compare(senha, funcionario.senha_hash);
    if (!senhaValida) return res.status(401).json({ message: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: funcionario.funcionario_id, email: funcionario.email, perfil_id: funcionario.perfil_id },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({ message: "Login bem-sucedido", token });
  } catch (err) {
    next(err);
  }
};