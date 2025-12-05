import express from "express";
import * as financeiroController from "../controller/financeiroController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Relatórios
router.get("/dashboard/kpis", financeiroController.relatorioKPIs);
router.get("/dashboard/categorias", financeiroController.relatorioCategorias);
router.get("/dashboard/formas-pagamento", financeiroController.relatorioFormasPagamento); // <--- NOVA ROTA
router.get("/dashboard/anual", financeiroController.relatorioAnual);
router.get("/fluxo-caixa", financeiroController.getFluxoCaixa);
// CRUD
router.get("/", financeiroController.listar);
router.get("/:id", financeiroController.buscarPorId);
router.get("/loja/:loja_id", financeiroController.listarPorLoja);
router.post("/", financeiroController.criar);
router.put("/:id", financeiroController.atualizar);
router.delete("/:id", financeiroController.deletar);

export default router;