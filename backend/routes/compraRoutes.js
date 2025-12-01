import express from "express";
import * as controller from "../controller/compraController.js";

const router = express.Router();

router.get("/", controller.listar);
router.post("/", controller.criar);
router.put("/:id/receber", controller.receber);

export default router;