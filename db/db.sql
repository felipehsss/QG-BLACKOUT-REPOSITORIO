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
);

CREATE TABLE perfis (
    perfil_id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT
);

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
    FOREIGN KEY (loja_id) REFERENCES tbl_lojas(loja_id),
    FOREIGN KEY (perfil_id) REFERENCES tbl_perfis(perfil_id)
);

CREATE TABLE fornecedores (
    fornecedor_id INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    contato_principal VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20)
);

CREATE TABLE produtos (
    produto_id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_venda DECIMAL(10, 2) NOT NULL
);

-- Módulo 2: Ponto de Venda (PDV)

CREATE TABLE sessoes_caixa (
    sessao_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    funcionario_abertura_id INT NOT NULL,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_inicial DECIMAL(10, 2) NOT NULL,
    funcionario_fechamento_id INT,
    data_fechamento TIMESTAMP,
    valor_total_apurado DECIMAL(10, 2),
    status ENUM('Aberta', 'Fechada') NOT NULL DEFAULT 'Aberta',
    FOREIGN KEY (loja_id) REFERENCES tbl_lojas(loja_id),
    FOREIGN KEY (funcionario_abertura_id) REFERENCES tbl_funcionarios(funcionario_id),
    FOREIGN KEY (funcionario_fechamento_id) REFERENCES tbl_funcionarios(funcionario_id)
);

CREATE TABLE vendas (
    venda_id INT PRIMARY KEY AUTO_INCREMENT,
    loja_id INT NOT NULL,
    sessao_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL,
    status_venda ENUM('Concluída', 'Cancelada') NOT NULL DEFAULT 'Concluída',
    FOREIGN KEY (loja_id) REFERENCES tbl_lojas(loja_id),
    FOREIGN KEY (sessao_id) REFERENCES tbl_sessoes_caixa(sessao_id),
    FOREIGN KEY (funcionario_id) REFERENCES tbl_funcionarios(funcionario_id)
);

CREATE TABLE itens_venda (
    item_venda_id INT PRIMARY KEY AUTO_INCREMENT,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario_momento DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES tbl_vendas(venda_id),
    FOREIGN KEY (produto_id) REFERENCES tbl_produtos(produto_id)
);

CREATE TABLE pagamentos_venda (
    pagamento_id INT PRIMARY KEY AUTO_INCREMENT,
    venda_id INT NOT NULL,
    metodo_pagamento ENUM('Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX') NOT NULL,
    valor_pago DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES tbl_vendas(venda_id)
);

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
    FOREIGN KEY (loja_id) REFERENCES tbl_lojas(loja_id),
    FOREIGN KEY (fornecedor_id) REFERENCES tbl_fornecedores(fornecedor_id)
);

// Tabela para registrar todas as movimentações financeiras
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
);


-- Populando dados iniciais essenciais
INSERT INTO tbl_perfis (nome, descricao) VALUES 
('Administrador', 'Acesso total ao sistema, incluindo cadastro de lojas e relatórios consolidados.'),
('Gerente de Loja', 'Acesso administrativo restrito aos dados da sua própria loja.'),
('Vendedor/Caixa', 'Acesso apenas ao módulo PDV para realizar vendas e controlar o caixa da sua loja.');