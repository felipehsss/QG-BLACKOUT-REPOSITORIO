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
-- Table structure for table `sessoes_caixa`
--

DROP TABLE IF EXISTS `sessoes_caixa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessoes_caixa` (
  `sessao_id` int(11) NOT NULL AUTO_INCREMENT,
  `loja_id` int(11) NOT NULL,
  `funcionario_abertura_id` int(11) NOT NULL,
  `data_abertura` timestamp NOT NULL DEFAULT current_timestamp(),
  `valor_inicial` decimal(10,2) NOT NULL,
  `funcionario_fechamento_id` int(11) DEFAULT NULL,
  `data_fechamento` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `valor_total_apurado` decimal(10,2) DEFAULT NULL,
  `status` enum('Aberta','Fechada') NOT NULL DEFAULT 'Aberta',
  PRIMARY KEY (`sessao_id`),
  KEY `loja_id` (`loja_id`),
  KEY `funcionario_abertura_id` (`funcionario_abertura_id`),
  KEY `funcionario_fechamento_id` (`funcionario_fechamento_id`),
  CONSTRAINT `sessoes_caixa_ibfk_1` FOREIGN KEY (`loja_id`) REFERENCES `lojas` (`loja_id`),
  CONSTRAINT `sessoes_caixa_ibfk_2` FOREIGN KEY (`funcionario_abertura_id`) REFERENCES `funcionarios` (`funcionario_id`),
  CONSTRAINT `sessoes_caixa_ibfk_3` FOREIGN KEY (`funcionario_fechamento_id`) REFERENCES `funcionarios` (`funcionario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessoes_caixa`
--

LOCK TABLES `sessoes_caixa` WRITE;
/*!40000 ALTER TABLE `sessoes_caixa` DISABLE KEYS */;
INSERT INTO `sessoes_caixa` VALUES (1,1,3,'2025-11-16 18:18:34',300.00,NULL,NULL,NULL,'Aberta'),(2,2,5,'2025-11-16 18:18:34',300.00,NULL,NULL,NULL,'Aberta'),(3,1,3,'2025-11-14 18:18:34',200.00,3,'2025-11-15 18:18:34',1500.00,'Fechada'),(4,2,5,'2025-11-14 18:18:34',200.00,5,'2025-11-15 18:18:34',1200.00,'Fechada');
/*!40000 ALTER TABLE `sessoes_caixa` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-01 16:59:42
