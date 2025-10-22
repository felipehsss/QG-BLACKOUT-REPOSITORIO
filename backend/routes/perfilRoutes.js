// perfilRoutes.js
import express from "express";
import * as perfilController from "../controller/perfilController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de perfis
router.get("/", perfilController.listar);
router.get("/:id", perfilController.buscarPorId);
router.post("/", perfilController.criar);
router.put("/:id", perfilController.atualizar);
router.delete("/:id", perfilController.deletar);

export default router;
