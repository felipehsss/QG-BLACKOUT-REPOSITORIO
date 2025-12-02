# ⚡ QG Blackout — Sistema de Gestão e PDV

Monorepo oficial do ecossistema QG Blackout: um sistema completo de **ERP + PDV** com API central, interface administrativa e interface operacional moderna.

## 📘 Visão Geral

Este repositório reúne todos os componentes do sistema, integrados para oferecer uma solução robusta, escalável e fácil de manter:

- **Backend (API)**: núcleo do sistema — regras de negócio, autenticação, comunicação com MySQL.
- **Frontend Admin**: interface administrativa completa para cadastros e configurações.
- **Frontend QGB**: interface visual moderna com dashboards operacionais.

## 🗂 Estrutura do Repositório

| Pasta            | Descrição                                     | Tecnologias                                 |
|------------------|-----------------------------------------------|---------------------------------------------|
| `/backend`       | API REST que gerencia todo o sistema          | Node.js, Express, MySQL, JWT               |
| `/frontend`      | Painel administrativo (gestão)               | Next.js, React 19, Shadcn/ui               |
| `/frontend-qgb`  | Interface operacional (visual)               | Next.js, DaisyUI, Recharts                 |
| `/db`            | Scripts SQL e backups                        | MySQL                                      |
| `/documentacao`  | Documentos e diagramas do projeto            | Markdown                                   |

## 🛠 Tecnologias Utilizadas

### 🔹 Backend (/backend)

- Node.js
- Express.js
- MySQL
- Autenticação JWT + bcrypt
- Uploads com Multer

### 🔹 Frontend Admin (/frontend)

- Next.js (App Router)
- React 19
- Tailwind + Shadcn/ui
- React Hook Form, Zod, react-imask
- Tabelas com TanStack
- Drag & Drop (Dnd-kit)

### 🔹 Frontend QGB (/frontend-qgb)

- Next.js
- TypeScript (suporte)
- Tailwind + DaisyUI + Shadcn/ui
- Gráficos com Recharts

## ⚙️ Pré-requisitos

Antes de iniciar, instale os seguintes componentes:

- **Node.js 18+**
- **MySQL** (local ou remoto)
- **Git**

## 🚀 Instalação e Execução

### 1️⃣ Configurar a Base de Dados

- Crie o schema no MySQL (ex.: `qg_db`).
- Importe o arquivo mais recente de `/db` (ex.: `Dump20251201/...`).

### 2️⃣ Iniciar o Backend

1. Navegue para o diretório `/backend`:

    ```bash
    cd backend
    npm install
    ```

2. Configure o ambiente:

    - Duplique o arquivo `.env.example` e renomeie para `.env`.
    - Preencha as credenciais MySQL (DB_HOST, DB_USER, DB_PASS, etc.).

3. Inicie o servidor:

    ```bash
    npm run dev
    ```

O servidor estará disponível em `http://localhost:3001`.

### 3️⃣ Iniciar o Frontend Admin

1. Navegue para o diretório `/frontend`:

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

O painel administrativo estará disponível em `http://localhost:3000`.

### 4️⃣ Iniciar o Frontend QGB

1. Navegue para o diretório `/frontend-qgb`:

    ```bash
    cd frontend-qgb
    npm install
    npm run dev
    ```

A interface operacional estará disponível em `http://localhost:3001` (ou outra porta, caso haja conflito).

## 📂 Funcionalidades do Sistema

### 🔐 Autenticação

- Login seguro
- Gestão de sessões com JWT

### 🧾 Cadastros Gerais

- Clientes
- Fornecedores
- Funcionários
- Lojas
- Produtos

### 📦 Gestão de Estoque

- Inventário
- Produtos de fornecedores
- Solicitações de reposição

### 💳 Ponto de Venda (PDV)

- Abertura e fecho de caixa
- Registro de vendas
- Pagamentos

### 💰 Financeiro

- Contas a pagar
- Fluxo de caixa
- Registros financeiros

### 📊 Relatórios e Dashboards

- Vendas
- Caixas
- Gráficos financeiros (via Recharts no QGB)

## 📝 Licença

Este software é **proprietário** e desenvolvido exclusivamente para o **QG Blackout**. Cópia, modificação, distribuição ou uso não autorizado são terminantemente proibidos.
