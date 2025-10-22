// funcionarioRoutes.js
import express from "express";
import * as funcionarioController from "../controller/funcionarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

//  Login público
router.post("/login", funcionarioController.login);

//  Rotas protegidas (apenas após login)
router.use(authMiddleware);
// CRUD de funcionários
router.get("/", funcionarioController.listar);
router.get("/:id", funcionarioController.buscarPorId);
router.post("/", funcionarioController.criar);
router.put("/:id", funcionarioController.atualizar);
router.delete("/:id", funcionarioController.deletar);

export default router;
