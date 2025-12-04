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
-- Table structure for table `funcionarios`
--

DROP TABLE IF EXISTS `funcionarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionarios` (
  `funcionario_id` int(11) NOT NULL AUTO_INCREMENT,
  `loja_id` int(11) NOT NULL,
  `perfil_id` int(11) NOT NULL,
  `nome_completo` varchar(150) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `telefone_contato` varchar(20) DEFAULT NULL,
  `is_ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_admissao` date DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`funcionario_id`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `email` (`email`),
  KEY `loja_id` (`loja_id`),
  KEY `perfil_id` (`perfil_id`),
  CONSTRAINT `funcionarios_ibfk_1` FOREIGN KEY (`loja_id`) REFERENCES `lojas` (`loja_id`),
  CONSTRAINT `funcionarios_ibfk_2` FOREIGN KEY (`perfil_id`) REFERENCES `perfis` (`perfil_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionarios`
--

LOCK TABLES `funcionarios` WRITE;
/*!40000 ALTER TABLE `funcionarios` DISABLE KEYS */;
INSERT INTO `funcionarios` VALUES (1,1,1,'Administrador do Sistema','000.000.000-00','admin@qg.com','$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO','(11) 98888-7777',1,'2025-01-01',NULL,4000.00),(2,1,2,'Gerente Loja Matriz','111.111.111-44','gerente.matriz@qg.com','$2b$10$k6HTJmMyvHs.TJRVQR5s6OBOSXKRBm1cVREWKD7ABjKh2lsb7k902','(11) 97777-1111',1,'2025-01-02',NULL,3000.00),(3,2,2,'Vendedor Loja Matriz','222.222.222-42','vendedor.matriz@qg.com','$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO','(11) 97777-2222',1,'2025-01-03',NULL,1200.00),(4,2,2,'Gerente Loja Filial','333.333.333-14','gerente.filial@qg.com','$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO','(11) 97777-3333',1,'2025-01-04',NULL,4000.00),(5,2,3,'Vendedor Loja Filial','444.444.444-67','vendedor.filial@qg.com','$2b$10$JUybh8FuYY4Y1W2DE4Uvb.2snJgcHCKYZcR5i9lZX0QpKQeMfzInO','(11) 97777-4444',1,'2025-01-05',NULL,1800.00),(6,4,3,'joao da silva','560.123.987-62','joaosilva@gmail.com','$2b$10$Xd9HQ7ZW8bS4Ady0ibQ/2.QGSIfwQNghu92IqTDFuo7xTayrQjpF2','11967426739',1,'2025-11-30',NULL,1800.00),(7,4,2,'funcionario teste','56080785862','functeste@gmail.com','$2b$10$WZ0qZnoRqy6FLgHIvLcPtef4KAEIc1ENYMtyrB7yyS2xumhEkp6Ye',NULL,1,NULL,NULL,0.00);
/*!40000 ALTER TABLE `funcionarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 12:52:06
