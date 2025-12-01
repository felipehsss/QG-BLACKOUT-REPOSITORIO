import express from "express";
import * as controller from "../controller/solicitacaoController.js";

const router = express.Router();

router.get("/", controller.listar);
router.post("/", controller.criar);
router.put("/:id/despachar", controller.despachar); // Rota alterada
router.put("/:id/receber", controller.receber);     // Nova rota
router.put("/:id/rejeitar", controller.rejeitar);

export default router;