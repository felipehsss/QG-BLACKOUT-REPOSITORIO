// sessaoCaixaRoutes.js
import express from "express";
import * as sessaoCaixaController from "../controller/sessaoCaixaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de sessões de caixa
router.get("/", sessaoCaixaController.listar);
router.get("/:id", sessaoCaixaController.buscarPorId);
router.post("/", sessaoCaixaController.criar);
router.put("/:id", sessaoCaixaController.atualizar);
router.delete("/:id", sessaoCaixaController.deletar);

export default router;
