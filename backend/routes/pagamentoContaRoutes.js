// pagamentoContaRoutes.js
import express from "express";
import * as pagamentoContaController from "../controller/pagamentoContaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de pagamentos de conta
router.get("/", pagamentoContaController.listar);
router.get("/:id", pagamentoContaController.buscarPorId);
router.get("/conta/:conta_pagar_id", pagamentoContaController.listarPorConta);
router.post("/", pagamentoContaController.criar);
router.put("/:id", pagamentoContaController.atualizar);
router.delete("/:id", pagamentoContaController.deletar);

export default router;
