// contaPagarRoutes.js
import express from "express";
import * as contaPagarController from "../controller/contaPagarController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de contas a pagar
router.get("/", contaPagarController.listar);
router.get("/:id", contaPagarController.buscarPorId);
router.get("/loja/:loja_id", contaPagarController.listarPorLoja);
router.post("/", contaPagarController.criar);
router.put("/:id", contaPagarController.atualizar);
router.delete("/:id", contaPagarController.deletar);

export default router;
