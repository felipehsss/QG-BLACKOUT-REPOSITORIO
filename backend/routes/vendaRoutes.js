// vendaRoutes.js
import express from "express";
import * as VendasController from "../controller/vendaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", VendasController.listar);
router.post("/", VendasController.criar);
router.use(authMiddleware); // Aplicando autenticação para as rotas abaixo
router.get("/relatorio", VendasController.getRelatorioVendas);
router.get("/:id", VendasController.buscarPorId);
router.put("/:id", VendasController.atualizar);
router.delete("/:id", VendasController.deletar);

export default router;
