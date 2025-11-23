import express from "express";
import * as clienteController from "../controller/clienteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../config/upload.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", clienteController.listar);
router.get("/:id", clienteController.buscarPorId);

// CORREÇÃO: Deixe APENAS estas linhas com upload.single
// Removi as linhas duplicadas que estavam causando o erro
router.post("/", upload.single("foto"), clienteController.criar);
router.put("/:id", upload.single("foto"), clienteController.atualizar);

router.delete("/:id", clienteController.deletar);

export default router;