// lojaRoutes.js
import express from "express";
import * as lojaController from "../controller/lojaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de lojas
router.get("/", lojaController.listar);
router.get("/:id", lojaController.buscarPorId);
router.post("/", lojaController.criar);
router.put("/:id", lojaController.atualizar);
router.delete("/:id", lojaController.deletar);

export default router;
