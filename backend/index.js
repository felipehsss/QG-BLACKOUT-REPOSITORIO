// Importação dos módulos necessários
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Importação dos middlewares
import errorHandler from "./middlewares/errorHandler.js";
import authMiddleware from "./middlewares/authMiddleware.js";

// Importação das rotas
import authRoutes from "./routes/authRoutes.js";
import funcionarioRoutes from "./routes/funcionarioRoutes.js";
import lojaRoutes from "./routes/lojaRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import sessaoCaixaRoutes from "./routes/sessaoCaixaRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";
import itemVendaRoutes from "./routes/itemVendaRoutes.js";
import pagamentoVendaRoutes from "./routes/pagamentoVendaRoutes.js";
import contaPagarRoutes from "./routes/contaPagarRoutes.js";
import pagamentoContaRoutes from "./routes/pagamentoContaRoutes.js";
import financeiroRoutes from "./routes/financeiroRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import estoqueRoutes from "./routes/estoqueRoutes.js";
import produtoFornecedorRoutes from "./routes/produtoFornecedorRoutes.js";
// Configuração do ambiente
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
// Servir arquivos estáticos da pasta uploads na rota /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rota raiz (teste rápido)
app.get("/", (req, res) => res.json({ message: "API QG funcionando !!! 🚀" }));

// Rotas principais
app.use("/api/auth", authRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/lojas", lojaRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/sessoes_caixa", sessaoCaixaRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/itens_venda", itemVendaRoutes);
app.use("/api/pagamentos_venda", pagamentoVendaRoutes);
app.use("/api/contas_a_pagar", contaPagarRoutes);
app.use("/api/pagamentos_conta", pagamentoContaRoutes);
app.use("/api/financeiro", financeiroRoutes);
app.use("/api/perfis", perfilRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/estoque", estoqueRoutes);
app.use("/api/produtos-fornecedores", produtoFornecedorRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);
// Inicialização do servidor
const PORT = 3080;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
