// itemVendaRoutes.js
import express from "express";
import * as itemVendaController from "../controller/itemVendaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de itens de venda
router.get("/", itemVendaController.listar);
router.get("/:id", itemVendaController.buscarPorId);
router.get("/venda/:venda_id", itemVendaController.listarPorVenda);
router.post("/", itemVendaController.criar);
router.put("/:id", itemVendaController.atualizar);
router.delete("/:id", itemVendaController.deletar);

export default router;
