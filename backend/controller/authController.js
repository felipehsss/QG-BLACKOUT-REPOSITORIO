// authController.js
import * as funcionarioModel from "../model/funcionarioModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const SECRET = process.env.JWT_SECRET || "chaveSecreta123";

// Login de funcionário (autenticação)
export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
    }

    const funcionario = await funcionarioModel.getByEmail(email);
    
    if (!funcionario || !funcionario.senha_hash) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, funcionario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        id: funcionario.funcionario_id,
        email: funcionario.email,
        perfil_id: funcionario.perfil_id,
      },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({ 
      message: "Login bem-sucedido", 
      token,
      user: {
        id: funcionario.funcionario_id,
        email: funcionario.email,
        perfil_id: funcionario.perfil_id,
        nome: funcionario.nome || null
      }
    });
  } catch (err) {
    next(err);
  }
};
    