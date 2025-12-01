import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


// Configuração para obter __dirname em módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importação das rotas
import authRoutes from "./routes/authRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import funcionarioRoutes from "./routes/funcionarioRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import lojaRoutes from "./routes/lojaRoutes.js";
import sessaoCaixaRoutes from "./routes/sessaoCaixaRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";
import itemVendaRoutes from "./routes/itemVendaRoutes.js";
import pagamentoVendaRoutes from "./routes/pagamentoVendaRoutes.js";
import estoqueRoutes from "./routes/estoqueRoutes.js";
import contaPagarRoutes from "./routes/contaPagarRoutes.js";
import financeiroRoutes from "./routes/financeiroRoutes.js";
import pagamentoContaRoutes from "./routes/pagamentoContaRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import produtoFornecedorRoutes from "./routes/produtoFornecedorRoutes.js";
import solicitacaoRoutes from "./routes/solicitacaoRoutes.js";


// Middlewares globais
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- CONFIGURAÇÃO CRÍTICA PARA AS FOTOS ---
// Isso permite acessar as fotos pela URL http://localhost:3080/uploads/nome-da-foto.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ------------------------------------------

// Definição das rotas
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/lojas", lojaRoutes);
app.use("/api/sessao-caixa", sessaoCaixaRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/itens-venda", itemVendaRoutes);
app.use("/api/pagamentos-venda", pagamentoVendaRoutes);
app.use("/api/estoque", estoqueRoutes);
app.use("/api/contas-pagar", contaPagarRoutes);
app.use("/api/financeiro", financeiroRoutes);
app.use("/api/pagamentos-conta", pagamentoContaRoutes);
app.use("/api/perfis", perfilRoutes);
app.use("/api/produto-fornecedor", produtoFornecedorRoutes);
app.use("/api/solicitacoes", solicitacaoRoutes);

// Middleware de erro (sempre o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3080;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});