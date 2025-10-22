import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Importação das rotas
import authRoutes from "./routes/authRoutes.js";
import funcionariosRoutes from "./routes/funcionariosRoutes.js";
import lojasRoutes from "./routes/lojasRoutes.js";
import produtosRoutes from "./routes/produtosRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import sessaoCaixaRoutes from "./routes/sessaoCaixaRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";
import itemVendaRoutes from "./routes/itemVendaRoutes.js";
import pagamentoVendaRoutes from "./routes/pagamentoVendaRoutes.js";
import contaPagarRoutes from "./routes/contaPagarRoutes.js";
import financeiroRoutes from "./routes/financeiroRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import pagamentoContaRoutes from "./routes/pagamentoContaRoutes.js";





// Configuração do ambiente
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Rota raiz para verificar se a API está funcionando

app.use("/api/contas_a_pagar", contaPagarRoutes);
app.get("/", (req, res) => res.json({ message: "API QG funcionando !!! " }));
app.use("/api/auth", authRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/lojas", lojasRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/sessoes_caixa", sessaoCaixaRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/itens_venda", itemVendaRoutes);
app.use("/api/pagamentos_venda", pagamentoVendaRoutes);
app.use("/api/financeiro", financeiroRoutes);
app.use("/api/perfis", perfilRoutes);
app.use("/api/pagamentos_conta", pagamentoContaRoutes);
// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
