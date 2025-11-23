import express from "express";
import * as produtoController from "../controller/produtoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../config/upload.js"; // <--- Importe o upload

const router = express.Router();

router.use(authMiddleware);

router.get("/", produtoController.listar);
router.get("/:id", produtoController.buscarPorId);

// Adicione upload.single('foto') nas rotas de criar e atualizar
router.post("/", upload.single("foto"), produtoController.criar);
router.put("/:id", upload.single("foto"), produtoController.atualizar);

router.delete("/:id", produtoController.deletar);

export default router;