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
-- Table structure for table `contas_a_pagar`
--

DROP TABLE IF EXISTS `contas_a_pagar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contas_a_pagar` (
  `conta_pagar_id` int(11) NOT NULL AUTO_INCREMENT,
  `loja_id` int(11) NOT NULL,
  `fornecedor_id` int(11) DEFAULT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `categoria` enum('Aluguel','Salários','Fornecedores','Impostos','Outros') NOT NULL,
  `status` enum('Pendente','Paga','Atrasada') NOT NULL DEFAULT 'Pendente',
  PRIMARY KEY (`conta_pagar_id`),
  KEY `loja_id` (`loja_id`),
  KEY `fornecedor_id` (`fornecedor_id`),
  CONSTRAINT `contas_a_pagar_ibfk_1` FOREIGN KEY (`loja_id`) REFERENCES `lojas` (`loja_id`),
  CONSTRAINT `contas_a_pagar_ibfk_2` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`fornecedor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contas_a_pagar`
--

LOCK TABLES `contas_a_pagar` WRITE;
/*!40000 ALTER TABLE `contas_a_pagar` DISABLE KEYS */;
INSERT INTO `contas_a_pagar` VALUES (1,1,1,'Compra de Pastilhas de Freio (NF 1001)',3200.00,'2025-11-01','2025-11-01','Fornecedores','Paga'),(2,1,2,'Compra de Velas e Cabos (NF 1002)',1500.00,'2025-11-06',NULL,'Fornecedores','Atrasada'),(3,1,NULL,'Aluguel Loja Matriz',5000.00,'2025-11-11',NULL,'Aluguel','Pendente'),(4,1,3,'Compra de Amortecedores (NF 1003)',4800.00,'2025-11-16',NULL,'Fornecedores','Pendente'),(5,2,4,'Compra de Filtros (NF 2001)',2750.00,'2025-11-08','2025-11-08','Fornecedores','Paga'),(6,2,NULL,'Salários Loja Filial',6000.00,'2025-11-11',NULL,'Salários','Pendente'),(7,2,1,'Compra de Discos de Freio (NF 2002)',1900.00,'2025-11-26',NULL,'Fornecedores','Pendente');
/*!40000 ALTER TABLE `contas_a_pagar` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24  0:58:17
