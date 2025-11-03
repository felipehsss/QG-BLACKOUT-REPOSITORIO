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

-- vizualizar tabelas

SELECT * FROM lojas;
SELECT * FROM perfis;
SELECT * FROM funcionarios;
SELECT * FROM fornecedores;
SELECT * FROM produtos;
SELECT * FROM sessoes_caixa;
SELECT * FROM vendas;
SELECT * FROM itens_venda;
SELECT * FROM pagamentos_venda;
SELECT * FROM contas_a_pagar;
SELECT * FROM financeiro;
SELECT * FROM clientes;



-- ----------------------------------------------------------------- DADOS AQUI -------------------------*******************!!!!!!!!!!!!!!!!!!!!!!#########################################



USE qg_db;

-- Módulo 1: Inserindo dados de cadastros base

-- Adicionar uma loja filial (a Matriz ID=1 já existe)
INSERT INTO lojas (nome, cnpj, endereco, telefone, is_matriz, is_ativo)
VALUES ('Filial Zona Leste', '11.111.111/0001-11', 'Av. das Peças, 500', '(11) 98888-8888', FALSE, TRUE);

-- Adicionar mais funcionários (o Admin ID=1 já existe)
-- Senha para todos é '123456' (o hash é o mesmo do admin)
INSERT INTO funcionarios (loja_id, perfil_id, nome_completo, cpf, email, senha_hash, telefone_contato, is_ativo, data_admissao)
VALUES 
(1, 2, 'Gerente Loja Matriz', '111.111.111-44', 'gerente.matriz@qg.com', '$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO', '(11) 97777-1111', TRUE, '2025-01-02'),
(1, 3, 'Vendedor Loja Matriz', '222.222.222-42', 'vendedor.matriz@qg.com', '$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO', '(11) 97777-2222', TRUE, '2025-01-03'),
(2, 2, 'Gerente Loja Filial', '333.333.333-14', 'gerente.filial@qg.com', '$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO', '(11) 97777-3333', TRUE, '2025-01-04'),
(2, 3, 'Vendedor Loja Filial', '444.444.444-67', 'vendedor.filial@qg.com', '$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO', '(11) 97777-4444', TRUE, '2025-01-05');

-- Adicionar Fornecedores de Auto-Peças
INSERT INTO fornecedores (razao_social, cnpj, contato_principal, email, telefone)
VALUES
('Distribuidora de Freios Bosch', '12.345.678/0001-01', 'Carlos Mendes', 'comercial@bosch.com', '(21) 98765-4321'),
('Mecânica Geral S.A. - Peças Motor', '98.765.432/0001-02', 'Juliana Paes', 'vendas@mecanicageral.com', '(51) 91234-5678'),
('Suspensão e Cia (Cofap)', '45.678.901/0001-03', 'Marcos Silva', 'contato@cofap.com', '(31) 94444-5555'),
('Filtros & Velas NGK', '33.444.555/0001-04', 'Fernanda Lima', 'filtros@ngk.com', '(41) 93333-2222');

-- Adicionar Produtos (Peças de Carros)
INSERT INTO produtos (sku, nome, descricao, preco_venda)
VALUES
('SKU-FO-001', 'Filtro de Óleo Fram', 'Filtro de Óleo PH5548 - Linha GM/Fiat', 35.00),
('SKU-FO-002', 'Filtro de Ar Mann', 'Filtro de Ar C29003 - Linha VW', 55.00),
('SKU-PF-001', 'Pastilha de Freio Dianteira Cobreq', 'Jogo de Pastilhas N-506 - Honda Civic 08-12', 120.00),
('SKU-PF-002', 'Pastilha de Freio Traseira Fras-le', 'Jogo de Pastilhas PD/45 - Toyota Corolla 10-14', 95.00),
('SKU-DF-001', 'Disco de Freio Fremax', 'Par Disco de Freio Dianteiro Ventilado - VW Gol G5/G6', 280.00),
('SKU-AM-001', 'Amortecedor Dianteiro Cofap', 'Par Amortecedor Dianteiro GP3011 - Fiat Palio 01-07', 450.00),
('SKU-AM-002', 'Amortecedor Traseiro Monroe', 'Par Amortecedor Traseiro 3702 - Ford Ka 15-19', 390.00),
('SKU-VV-001', 'Vela de Ignição NGK', 'Jogo de Velas BKR6E - 4 unidades', 80.00),
('SKU-CV-001', 'Cabo de Vela NGK', 'Jogo de Cabos de Vela SC-G73 - Linha GM', 110.00),
('SKU-OL-001', 'Óleo de Motor 5W30 Sintético', 'Lubrificante 1L 5W30 Shell Helix', 48.00),
('SKU-OL-002', 'Óleo de Motor 15W40 Semi-Sintético', 'Lubrificante 1L 15W40 Mobil', 38.00),
('SKU-BT-001', 'Bateria Moura 60Ah', 'Bateria M60AD - 18 meses garantia', 420.00),
('SKU-BT-002', 'Bateria Heliar 50Ah', 'Bateria HF50GD - 15 meses garantia', 350.00),
('SKU-PL-001', 'Palheta Limpador Parabrisa 21"', 'Palheta Silicone Bosch Aerofit 21 polegadas', 45.00),
('SKU-PL-002', 'Palheta Limpador Parabrisa 18"', 'Palheta Silicone Bosch Aerofit 18 polegadas', 42.00),
('SKU-CR-001', 'Correia Dentada Gates', 'Correia Sincronizadora CT488 - Linha Fiat Fire', 75.00),
('SKU-TR-001', 'Terminal de Direção Nakata', 'Terminal de Direção N-1050 - Lado Direito - Celta/Prisma', 68.00),
('SKU-PV-001', 'Pivô de Suspensão TRW', 'Pivô da Bandeja - PVI1022 - Ford Fiesta', 85.00),
('SKU-AD-001', 'Aditivo Radiador Paraflu', 'Aditivo Orgânico Rosa 1L - Concentrado', 25.00),
('SKU-LP-001', 'Lâmpada H4 Super Branca', 'Par Lâmpada H4 Philips CrystalVision', 90.00);

-- Adicionar Clientes (Físicos e Oficinas)
INSERT INTO clientes (nome, telefone, email, endereco, tipo_cliente, cpf, cnpj, razao_social)
VALUES
('Ana Beatriz Silva', '(11) 91111-1111', 'ana.silva@email.com', 'Rua das Flores, 10', 'PF', '111.111.111-01', NULL, NULL),
('Bruno Costa', '(11) 92222-2222', 'bruno.costa@email.com', 'Av. Paulista, 1000', 'PF', '222.222.222-02', NULL, NULL),
('Oficina do Zé', '(11) 3030-4040', 'compras@oficinaze.com', 'Av. Faria Lima, 500', 'PJ', NULL, '01.234.567/0001-10', 'José Auto Peças e Mecânica ME'),
('Carla Dias', '(11) 93333-3333', 'carla.dias@email.com', 'Rua Augusta, 200', 'PF', '333.333.333-03', NULL, NULL),
('David Souza', '(21) 94444-4444', 'david.souza@email.com', 'Rua de Copacabana, 30', 'PF', '444.444.444-04', NULL, NULL),
('Auto Elétrica Impacto', '(51) 95555-5555', 'contato@eletricaimpacto.com', 'Av. Ipiranga, 800', 'PJ', NULL, '02.345.678/0001-20', 'Impacto Serviços Automotivos Ltda'),
('Fernanda Moreira', '(31) 96666-6666', 'fernanda.moreira@email.com', 'Rua da Bahia, 400', 'PF', '555.555.555-05', NULL, NULL),
('Gustavo Lima', '(41) 97777-7777', 'gustavo.lima@email.com', 'Rua XV de Novembro, 50', 'PF', '666.666.666-06', NULL, NULL),
('Centro Automotivo FastCar', '(11) 2020-3030', 'financeiro@fastcar.com', 'Rua dos Pinheiros, 600', 'PJ', NULL, '03.456.789/0001-30', 'FastCar Reparos Rápidos ME'),
('Helena Santos', '(11) 98888-8888', 'helena.santos@email.com', 'Alameda Santos, 700', 'PF', '777.777.777-07', NULL, NULL);

-- Módulo 2: Ponto de Venda (PDV)

-- Criar Sessões de Caixa
-- (loja_id, funcionario_abertura_id, valor_inicial, status)
-- ID Func Vendedor Matriz = 3
-- ID Func Vendedor Filial = 5

-- Sessão ABERTA para a Matriz
INSERT INTO sessoes_caixa (loja_id, funcionario_abertura_id, valor_inicial, status)
VALUES (1, 3, 300.00, 'Aberta');

-- Sessão ABERTA para a Filial
INSERT INTO sessoes_caixa (loja_id, funcionario_abertura_id, valor_inicial, status)
VALUES (2, 5, 300.00, 'Aberta');

-- Sessões FECHADAS (Histórico)
INSERT INTO sessoes_caixa (loja_id, funcionario_abertura_id, valor_inicial, funcionario_fechamento_id, data_abertura, data_fechamento, valor_total_apurado, status)
VALUES 
(1, 3, 200.00, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 1500.00, 'Fechada'),
(2, 5, 200.00, 5, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 1200.00, 'Fechada');


-- Módulo 3: Geração de grande volume de VENDAS (Usando Stored Procedure)

-- Alteramos o delimitador para criar a procedure
DELIMITER //

CREATE PROCEDURE sp_gerar_vendas_massa(IN num_vendas INT, IN loja_id_param INT)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE v_venda_id INT;
    DECLARE v_sessao_id INT;
    DECLARE v_funcionario_id INT;
    DECLARE v_valor_total_venda DECIMAL(10, 2);
    DECLARE v_num_itens INT;
    DECLARE j INT DEFAULT 0;
    DECLARE v_produto_id INT;
    DECLARE v_preco_produto DECIMAL(10, 2);
    DECLARE v_quantidade INT;
    DECLARE v_subtotal DECIMAL(10, 2);
    DECLARE v_metodo_pgto ENUM('Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX');
    DECLARE v_data_venda TIMESTAMP;
    DECLARE max_produto_id INT;
    DECLARE min_produto_id INT;

    -- Pegar a SESSÃO ABERTA da loja
    SELECT sessao_id INTO v_sessao_id 
    FROM sessoes_caixa 
    WHERE loja_id = loja_id_param AND status = 'Aberta'
    LIMIT 1;
    
    -- Pegar um VENDEDOR (perfil=3) da loja
    SELECT funcionario_id INTO v_funcionario_id 
    FROM funcionarios 
    WHERE loja_id = loja_id_param AND perfil_id = 3
    ORDER BY RAND()
    LIMIT 1;
    
    -- IDs min/max de produtos para sorteio
    SELECT MIN(produto_id), MAX(produto_id) INTO min_produto_id, max_produto_id FROM produtos;

    -- Se não houver sessão aberta ou vendedor, não faz nada
    IF v_sessao_id IS NOT NULL AND v_funcionario_id IS NOT NULL THEN
    
        -- Loop principal de VENDAS
        WHILE i < num_vendas DO
            SET v_valor_total_venda = 0;
            -- Seta uma data de venda aleatória nos últimos 30 dias
            SET v_data_venda = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30 * 24 * 60) MINUTE);
        
            -- 1. Cria a VENDA (com valor total 0 por enquanto)
            INSERT INTO vendas (loja_id, sessao_id, funcionario_id, data_venda, valor_total, status_venda)
            VALUES (loja_id_param, v_sessao_id, v_funcionario_id, v_data_venda, 0.00, 'Concluída');
            
            SELECT LAST_INSERT_ID() INTO v_venda_id;

            -- 2. Loop para criar ITENS DA VENDA (de 1 a 5 itens por venda)
            SET j = 0;
            SET v_num_itens = FLOOR(RAND() * 5) + 1;
            
            WHILE j < v_num_itens DO
                -- Pega um produto aleatório
                SET v_produto_id = FLOOR(RAND() * (max_produto_id - min_produto_id + 1)) + min_produto_id;
                SELECT preco_venda INTO v_preco_produto FROM produtos WHERE produto_id = v_produto_id;
                
                SET v_quantidade = FLOOR(RAND() * 3) + 1;
                SET v_subtotal = v_preco_produto * v_quantidade;

                -- Insere o item
                INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario_momento, subtotal)
                VALUES (v_venda_id, v_produto_id, v_quantidade, v_preco_produto, v_subtotal);

                SET v_valor_total_venda = v_valor_total_venda + v_subtotal;
                SET j = j + 1;
            END WHILE;

            -- 3. Atualiza o VALOR TOTAL da venda
            UPDATE vendas SET valor_total = v_valor_total_venda WHERE venda_id = v_venda_id;

            -- 4. Cria o PAGAMENTO
            SELECT ELT(FLOOR(RAND() * 4) + 1, 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX') INTO v_metodo_pgto;
            
            INSERT INTO pagamentos_venda (venda_id, metodo_pagamento, valor_pago)
            VALUES (v_venda_id, v_metodo_pgto, v_valor_total_venda);

            -- 5. Cria o registro FINANCEIRO (Entrada)
            INSERT INTO financeiro (loja_id, tipo, origem, referencia_id, descricao, valor, data_movimento)
            VALUES (loja_id_param, 'Entrada', 'Venda', v_venda_id, CONCAT('Venda ID ', v_venda_id), v_valor_total_venda, v_data_venda);
            
            SET i = i + 1;
        END WHILE;
    
    END IF;
END//

-- Voltamos o delimitador ao normal
DELIMITER ;


-- Módulo 3: Inserindo Contas a Pagar e Financeiro (Saídas)

-- ID Fornecedores: 1 (Bosch), 2 (Mecânica Geral), 3 (Cofap), 4 (NGK)
-- ID Lojas: 1 (Matriz), 2 (Filial)

INSERT INTO contas_a_pagar (loja_id, fornecedor_id, descricao, valor, data_vencimento, data_pagamento, categoria, status)
VALUES 
(1, 1, 'Compra de Pastilhas de Freio (NF 1001)', 3200.00, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), 'Fornecedores', 'Paga'),
(1, 2, 'Compra de Velas e Cabos (NF 1002)', 1500.00, DATE_SUB(NOW(), INTERVAL 10 DAY), NULL, 'Fornecedores', 'Atrasada'),
(1, NULL, 'Aluguel Loja Matriz', 5000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, 'Aluguel', 'Pendente'),
(1, 3, 'Compra de Amortecedores (NF 1003)', 4800.00, NOW(), NULL, 'Fornecedores', 'Pendente'),
(2, 4, 'Compra de Filtros (NF 2001)', 2750.00, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'Fornecedores', 'Paga'),
(2, NULL, 'Salários Loja Filial', 6000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, 'Salários', 'Pendente'),
(2, 1, 'Compra de Discos de Freio (NF 2002)', 1900.00, DATE_ADD(NOW(), INTERVAL 10 DAY), NULL, 'Fornecedores', 'Pendente');

-- Adicionar registros financeiros para as SAÍDAS (Contas Pagas)
-- (baseado nos IDs auto-increment das contas_a_pagar, assumindo que começam em 1)
INSERT INTO financeiro (loja_id, tipo, origem, referencia_id, descricao, valor, data_movimento)
VALUES
-- Referente à conta_pagar_id = 1 (Compra Pastilhas)
(1, 'Saída', 'Conta a Pagar', 1, 'Pgto NF 1001 - Distribuidora de Freios Bosch', 3200.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
-- Referente à conta_pagar_id = 5 (Compra Filtros)
(2, 'Saída', 'Conta a Pagar', 5, 'Pgto NF 2001 - Filtros & Velas NGK', 2750.00, DATE_SUB(NOW(), INTERVAL 8 DAY));


-- ***** EXECUÇÃO DA GERAÇÃO DE DADOS EM MASSA *****
-- Sintaxe: CALL sp_gerar_vendas_massa( <numero_de_vendas>, <loja_id> );

-- Gerar 150 vendas para a Loja Matriz (ID=1)
CALL sp_gerar_vendas_massa(150, 1);

-- Gerar 100 vendas para a Loja Filial (ID=2)
CALL sp_gerar_vendas_massa(100, 2);


-- (Opcional) Remover a procedure após o uso para limpar o banco
-- DROP PROCEDURE sp_gerar_vendas_massa;

SELECT 'Dados de AUTO-PEÇAS em massa gerados com sucesso!' as status;
aa


