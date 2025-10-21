import express from 'express';
import {
  getFuncionarios,
  getFuncionario,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario
} from '../controllers/funcionariosController.js';

const router = express.Router();

router.get('/', getFuncionarios);
router.get('/:id', getFuncionario);
router.post('/', createFuncionario);
router.put('/:id', updateFuncionario);
router.delete('/:id', deleteFuncionario);

export default router;
