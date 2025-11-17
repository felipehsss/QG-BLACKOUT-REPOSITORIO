import express from "express";
import * as clienteController from "../controller/clienteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", clienteController.listar);
router.get("/:id", clienteController.buscarPorId);
router.post("/", clienteController.criar);
router.put("/:id", clienteController.atualizar);
router.delete("/:id", clienteController.deletar);

export default router;