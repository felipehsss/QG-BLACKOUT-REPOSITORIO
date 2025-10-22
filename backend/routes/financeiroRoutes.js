// financeiroRoutes.js
import express from "express";
import * as financeiroController from "../controller/financeiroController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD financeiro
router.get("/", financeiroController.listar);
router.get("/:id", financeiroController.buscarPorId);
router.get("/loja/:loja_id", financeiroController.listarPorLoja);
router.post("/", financeiroController.criar);
router.put("/:id", financeiroController.atualizar);
router.delete("/:id", financeiroController.deletar);

export default router;
