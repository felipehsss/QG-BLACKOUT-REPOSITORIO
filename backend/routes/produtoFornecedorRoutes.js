// backend/routes/produtoFornecedorRoutes.js
import express from "express";
import * as pfController from "../controller/produtoFornecedorController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware); // Protege todas as rotas

// POST /api/produtos-fornecedores/ (Linkar ou atualizar custo)
router.post("/", pfController.linkar);

// DELETE /api/produtos-fornecedores/:produtoId/:fornecedorId (Deslinkar)
router.delete("/:produtoId/:fornecedorId", pfController.deslinkar);

// GET /api/produtos-fornecedores/produto/:produtoId (Listar fornecedores de um produto)
router.get("/produto/:produtoId", pfController.listarFornecedores);

// GET /api/produtos-fornecedores/fornecedor/:fornecedorId (Listar produtos de um fornecedor)
router.get("/fornecedor/:fornecedorId", pfController.listarProdutos);

export default router;