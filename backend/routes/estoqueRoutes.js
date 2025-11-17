// backend/routes/estoqueRoutes.js
import express from "express";
import * as estoqueController from "../controller/estoqueController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
// Futuramente, você pode criar middlewares de Role (admin, gerente)
// import { admin, gerente } from "../middlewares/roleMiddleware.js"; 

const router = express.Router();

// Todas as rotas de estoque exigem autenticação
router.use(authMiddleware);

// Listar todo o estoque (GET /api/estoque)
// Provavelmente apenas para Gerentes/Admins
router.get("/", /* gerente, */ estoqueController.listar);

// Dar entrada de estoque (POST /api/estoque)
// Provavelmente apenas para Gerentes/Admins
router.post("/", /* gerente, */ estoqueController.darEntrada);

// Buscar por ID do estoque (GET /api/estoque/123)
router.get("/:id", estoqueController.buscarPorId);

// Buscar por Produto e Loja (GET /api/estoque/produto/5/loja/1)
// Útil para o PDV checar a quantidade
router.get("/produto/:produtoId/loja/:lojaId", estoqueController.buscarPorProdutoLoja);

// Ajustar estoque manual (PUT /api/estoque/123)
// Provavelmente apenas para Gerentes/Admins
router.put("/:id", /* gerente, */ estoqueController.atualizar);

// Deletar item (DELETE /api/estoque/123)
// Provavelmente apenas para Admins
router.delete("/:id", /* admin, */ estoqueController.deletar);

export default router;