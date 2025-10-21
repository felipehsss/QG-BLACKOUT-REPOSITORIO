import bcrypt from 'bcryptjs';
import { create, readAll, read, update, deleteRecord } from '../config/database.js';

const table = 'funcionarios';

export const getFuncionarios = async (req, res) => {
  const funcionarios = await readAll(table);
  res.json(funcionarios);
};

export const getFuncionario = async (req, res) => {
  const funcionario = await read(table, `funcionario_id = ${req.params.id}`);
  if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });
  res.json(funcionario);
};

export const createFuncionario = async (req, res) => {
  try {
    const { loja_id, perfil_id, nome_completo, cpf, email, senha, telefone_contato } = req.body;

    const senha_hash = await bcrypt.hash(senha, 10);
    const novoId = await create(table, {
      loja_id,
      perfil_id,
      nome_completo,
      cpf,
      email,
      senha_hash,
      telefone_contato
    });

    res.status(201).json({ message: 'Funcionário criado com sucesso!', funcionario_id: novoId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFuncionario = async (req, res) => {
  const id = req.params.id;
  const dados = req.body;
  const rows = await update(table, dados, `funcionario_id = ${id}`);
  res.json({ message: 'Funcionário atualizado', rows });
};

export const deleteFuncionario = async (req, res) => {
  const id = req.params.id;
  const rows = await deleteRecord(table, `funcionario_id = ${id}`);
  res.json({ message: 'Funcionário excluído', rows });
};
