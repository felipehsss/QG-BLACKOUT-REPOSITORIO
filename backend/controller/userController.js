// backend/controllers/userController.js


const UserModel = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll(); // Chama o Model
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.getById(userId); // Chama o Model
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = req.body;
    const insertedId = await UserModel.create(newUser); // Chama o Model
    res.status(201).json({ id: insertedId, ...newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};