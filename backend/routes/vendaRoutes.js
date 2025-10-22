// vendaRoutes.js
import express from "express";
import * as vendaController from "../controller/vendaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de vendas
router.get("/", vendaController.listar);
router.get("/:id", vendaController.buscarPorId);
router.post("/", vendaController.criar);
router.put("/:id", vendaController.atualizar);
router.delete("/:id", vendaController.deletar);

export default router;
