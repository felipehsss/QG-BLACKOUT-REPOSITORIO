import express from "express";
import * as clienteController from "../controller/clienteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../config/upload.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", clienteController.listar);
router.get("/:id", clienteController.buscarPorId);
router.post("/", clienteController.criar);
router.put("/:id", clienteController.atualizar);
router.delete("/:id", clienteController.deletar);
// Adicione upload.single('foto')
router.post("/", upload.single("foto"), clienteController.criar);
router.put("/:id", upload.single("foto"), clienteController.atualizar);

export default router;