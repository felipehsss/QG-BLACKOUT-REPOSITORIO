// fornecedorRoutes.js
import express from "express";
import * as fornecedorController from "../controller/fornecedorController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de fornecedores
router.get("/", fornecedorController.listar);
router.get("/:id", fornecedorController.buscarPorId);
router.post("/", fornecedorController.criar);
router.put("/:id", fornecedorController.atualizar);
router.delete("/:id", fornecedorController.deletar);

export default router;
