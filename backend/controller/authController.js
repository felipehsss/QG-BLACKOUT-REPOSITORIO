import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { read } from "../config/database.js";

dotenv.config();

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const funcionario = await read("funcionarios", `email = '${email}'`);
    if (!funcionario) return res.status(404).json({ error: "Usuário não encontrado" });

    const validaSenha = await bcrypt.compare(senha, funcionario.senha_hash);
    if (!validaSenha) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { id: funcionario.funcionario_id, email: funcionario.email, perfil: funcionario.perfil_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ message: "Login realizado com sucesso!", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
