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
-- Table structure for table `pedidos_compra`
--

DROP TABLE IF EXISTS `pedidos_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos_compra` (
  `pedido_compra_id` int(11) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int(11) NOT NULL,
  `loja_destino_id` int(11) NOT NULL DEFAULT 1,
  `data_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_previsao_entrega` date DEFAULT NULL,
  `status` enum('Pendente','Entregue','Cancelado') DEFAULT 'Pendente',
  `valor_total_estimado` decimal(10,2) DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  PRIMARY KEY (`pedido_compra_id`),
  KEY `fornecedor_id` (`fornecedor_id`),
  KEY `loja_destino_id` (`loja_destino_id`),
  CONSTRAINT `pedidos_compra_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`fornecedor_id`),
  CONSTRAINT `pedidos_compra_ibfk_2` FOREIGN KEY (`loja_destino_id`) REFERENCES `lojas` (`loja_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos_compra`
--

LOCK TABLES `pedidos_compra` WRITE;
/*!40000 ALTER TABLE `pedidos_compra` DISABLE KEYS */;
INSERT INTO `pedidos_compra` VALUES (1,1,1,'2025-12-01 05:02:07',NULL,'Entregue',200.00,'urgencia'),(2,1,1,'2025-12-01 05:11:16',NULL,'Entregue',200.00,''),(3,2,1,'2025-12-01 05:30:49',NULL,'Entregue',400.00,''),(4,2,1,'2025-12-01 17:42:48',NULL,'Entregue',20.00,'');
/*!40000 ALTER TABLE `pedidos_compra` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-02 12:04:52
