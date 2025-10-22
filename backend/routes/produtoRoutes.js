// produtoRoutes.js
import express from "express";
import * as produtoController from "../controller/produtoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas de produto exigem autenticação
router.use(authMiddleware);

// CRUD de produtos
router.get("/", produtoController.listar);
router.get("/:id", produtoController.buscarPorId);
router.post("/", produtoController.criar);
router.put("/:id", produtoController.atualizar);
router.delete("/:id", produtoController.deletar);

export default router;
