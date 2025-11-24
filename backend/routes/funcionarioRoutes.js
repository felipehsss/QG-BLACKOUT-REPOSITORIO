import express from "express";
import * as funcionarioController from "../controller/funcionarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../config/upload.js"; // <--- Importe o upload

const router = express.Router();

// Login público (sem alterar)
router.post("/login", funcionarioController.login);

// Rotas protegidas
router.use(authMiddleware);

router.get("/", funcionarioController.listar);
router.get("/:id", funcionarioController.buscarPorId);

// Adicione upload.single('foto') nas rotas de escrita
router.post("/", upload.single("foto"), funcionarioController.criar);
router.put("/:id", upload.single("foto"), funcionarioController.atualizar);

router.delete("/:id", funcionarioController.deletar);

export default router;