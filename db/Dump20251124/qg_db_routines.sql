CREATE DATABASE  IF NOT EXISTS `qg_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `qg_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: qg_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping events for database 'qg_db'
--

--
-- Dumping routines for database 'qg_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_gerar_vendas_massa` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_gerar_vendas_massa`(IN num_vendas INT, IN loja_id_param INT)
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
                
                -- ******** INÍCIO DA CORREÇÃO ********
                -- Pega um ID de produto e seu preço que REALMENTE EXISTE na tabela
                SELECT produto_id, preco_venda INTO v_produto_id, v_preco_produto
                FROM produtos
                ORDER BY RAND()
                LIMIT 1;
                -- ******** FIM DA CORREÇÃO ********
                
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24  0:58:18
