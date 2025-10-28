-- Criar banco de dados
CREATE DATABASE qg_db;
USE qg_db;
-- drop database qg_db;

-- Módulo 1: Cadastros e Controle de Acesso

CREATE TABLE lojas (
    loja_id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    is_matriz BOOLEAN NOT NULL DEFAULT FALSE,
    is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE perfis (
    perfil_id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT
) ENGINE=InnoDB;

CREATE TABLE funcionarios (
    funcionario_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    perfil_id INT NOT NULL,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone_contato VARCHAR(20),
    is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_admissao DATE,
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id),
    FOREIGN KEY (perfil_id) REFERENCES perfis(perfil_id)
) ENGINE=InnoDB;

CREATE TABLE fornecedores (
    fornecedor_id INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    contato_principal VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE produtos (
    produto_id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_venda DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB;

-- Módulo 2: Ponto de Venda (PDV)

CREATE TABLE sessoes_caixa (
    sessao_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    funcionario_abertura_id INT NOT NULL,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_inicial DECIMAL(10, 2) NOT NULL,
    funcionario_fechamento_id INT,
data_fechamento TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    valor_total_apurado DECIMAL(10, 2),
    status ENUM('Aberta', 'Fechada') NOT NULL DEFAULT 'Aberta',
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id),
    FOREIGN KEY (funcionario_abertura_id) REFERENCES funcionarios(funcionario_id),
    FOREIGN KEY (funcionario_fechamento_id) REFERENCES funcionarios(funcionario_id)
) ENGINE=InnoDB;

CREATE TABLE vendas (
    venda_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    sessao_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL,
    status_venda ENUM('Concluída', 'Cancelada') NOT NULL DEFAULT 'Concluída',
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id),
    FOREIGN KEY (sessao_id) REFERENCES sessoes_caixa(sessao_id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(funcionario_id)
) ENGINE=InnoDB;

CREATE TABLE itens_venda (
    item_venda_id INT PRIMARY KEY AUTO_INCREMENT,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario_momento DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(venda_id),
    FOREIGN KEY (produto_id) REFERENCES produtos(produto_id)
) ENGINE=InnoDB;

CREATE TABLE pagamentos_venda (
    pagamento_id INT PRIMARY KEY AUTO_INCREMENT,
    venda_id INT NOT NULL,
    metodo_pagamento ENUM('Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX') NOT NULL,
    valor_pago DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(venda_id)
) ENGINE=InnoDB;

-- Módulo 3: Gestão Financeira

CREATE TABLE contas_a_pagar (
    conta_pagar_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    fornecedor_id INT,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    categoria ENUM('Aluguel', 'Salários', 'Fornecedores', 'Impostos', 'Outros') NOT NULL,
    status ENUM('Pendente', 'Paga', 'Atrasada') NOT NULL DEFAULT 'Pendente',
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id),
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(fornecedor_id)
) ENGINE=InnoDB;

-- Tabela para registrar todas as movimentações financeiras
CREATE TABLE financeiro (
    financeiro_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    tipo ENUM('Entrada', 'Saída') NOT NULL,
    origem ENUM('Venda', 'Conta a Pagar', 'Outro') NOT NULL,
    referencia_id INT,
    descricao VARCHAR(255),
    valor DECIMAL(10, 2) NOT NULL,
    data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loja_id) REFERENCES lojas(loja_id)
) ENGINE=InnoDB;

-- Tabela  Clientes
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL, -- Nome da pessoa física ou nome fantasia da empresa
    telefone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    endereco VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_cliente ENUM('PF', 'PJ') NOT NULL DEFAULT 'PF', -- Para diferenciar Pessoa Física e Jurídica
    cpf VARCHAR(14) UNIQUE NULL, -- CPF para PF
    cnpj VARCHAR(18) UNIQUE NULL, -- CNPJ para PJ
    razao_social VARCHAR(100) NULL, -- Razão Social para PJ (nome legal)
    nome_fantasia VARCHAR(100) NULL, -- Nome Fantasia (se diferente do nome/razao_social, pode usar 'nome' para isso)
    inscricao_estadual VARCHAR(20) NULL -- Inscrição Estadual para PJ, se aplicável
);
 

-- Populando dados iniciais essenciais
INSERT INTO perfis (nome, descricao) VALUES 
('Administrador', 'Acesso total ao sistema, incluindo cadastro de lojas e relatórios consolidados.'),
('Gerente de Loja', 'Acesso administrativo restrito aos dados da sua própria loja.'),
('Vendedor/Caixa', 'Acesso apenas ao módulo PDV para realizar vendas e controlar o caixa da sua loja.');

-- CRIANDO O NECESSARIO ------------------------------------------------------- ****************************************------------------------

INSERT INTO lojas (nome, cnpj, endereco, telefone, is_matriz)
VALUES ('Loja Matriz QG', '00.000.000/0001-00', 'Rua Principal, 1000', '(11) 99999-9999', TRUE);

--

INSERT INTO funcionarios (
    loja_id, perfil_id, nome_completo, cpf, email, senha_hash, telefone_contato, is_ativo, data_admissao
)
VALUES (1,1,'Administrador do Sistema','000.000.000-00','admin@qg.com','$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO','(11) 98888-7777',TRUE,'2025-01-01');


