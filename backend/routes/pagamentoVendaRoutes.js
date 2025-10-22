// pagamentoVendaRoutes.js
import express from "express";
import * as pagamentoVendaController from "../controller/pagamentoVendaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de pagamentos de venda
router.get("/", pagamentoVendaController.listar);
router.get("/:id", pagamentoVendaController.buscarPorId);
router.get("/venda/:venda_id", pagamentoVendaController.listarPorVenda);
router.post("/", pagamentoVendaController.criar);
router.put("/:id", pagamentoVendaController.atualizar);
router.delete("/:id", pagamentoVendaController.deletar);

export default router;
