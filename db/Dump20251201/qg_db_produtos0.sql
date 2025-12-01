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
-- Table structure for table `produtos`
--

DROP TABLE IF EXISTS `produtos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos` (
  `produto_id` int(11) NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco_custo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preco_venda` decimal(10,2) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `fornecedor_id` int(11) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `ano` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`produto_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_produto_fornecedor_principal` (`fornecedor_id`),
  CONSTRAINT `fk_produto_fornecedor_principal` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`fornecedor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos`
--

LOCK TABLES `produtos` WRITE;
/*!40000 ALTER TABLE `produtos` DISABLE KEYS */;
INSERT INTO `produtos` VALUES (1,'SKU-FO-001','Filtro de Óleo Fram','Filtro de Óleo PH5548 - Linha GM/Fiat',0.00,35.00,NULL,NULL,NULL,NULL,NULL,NULL),(2,'SKU-FO-002','Filtro de Ar Mann','Filtro de Ar C29003 - Linha VW',20.00,55.00,NULL,NULL,NULL,NULL,NULL,NULL),(3,'SKU-PF-001','Pastilha de Freio Dianteira Cobreq','Jogo de Pastilhas N-506 - Honda Civic 08-12',0.00,120.00,NULL,NULL,NULL,NULL,NULL,NULL),(4,'SKU-PF-002','Pastilha de Freio Traseira Fras-le','Jogo de Pastilhas PD/45 - Toyota Corolla 10-14',20.00,95.00,NULL,NULL,NULL,NULL,NULL,NULL),(5,'SKU-DF-001','Disco de Freio Fremax','Par Disco de Freio Dianteiro Ventilado - VW Gol G5/G6',0.00,280.00,NULL,NULL,NULL,NULL,NULL,NULL),(6,'SKU-AM-001','Amortecedor Dianteiro Cofap','Par Amortecedor Dianteiro GP3011 - Fiat Palio 01-07',0.00,450.00,NULL,NULL,NULL,2,NULL,NULL),(7,'SKU-AM-002','Amortecedor Traseiro Monroe','Par Amortecedor Traseiro 3702 - Ford Ka 15-19',0.00,390.00,NULL,NULL,NULL,2,NULL,NULL),(8,'SKU-VV-001','Vela de Ignição NGK','Jogo de Velas BKR6E - 4 unidades',0.00,80.00,NULL,NULL,NULL,NULL,NULL,NULL),(9,'SKU-CV-001','Cabo de Vela NGK','Jogo de Cabos de Vela SC-G73 - Linha GM',0.00,110.00,NULL,NULL,NULL,NULL,NULL,NULL),(10,'SKU-OL-001','Óleo de Motor 5W30 Sintético','Lubrificante 1L 5W30 Shell Helix',0.00,48.00,NULL,NULL,NULL,NULL,NULL,NULL),(11,'SKU-OL-002','Óleo de Motor 15W40 Semi-Sintético','Lubrificante 1L 15W40 Mobil',0.00,38.00,NULL,NULL,NULL,NULL,NULL,NULL),(12,'SKU-BT-001','Bateria Moura 60Ah','Bateria M60AD - 18 meses garantia',0.00,420.00,NULL,NULL,NULL,NULL,NULL,NULL),(13,'SKU-BT-002','Bateria Heliar 50Ah','Bateria HF50GD - 15 meses garantia',0.00,350.00,NULL,NULL,NULL,NULL,NULL,NULL),(14,'SKU-PL-001','Palheta Limpador Parabrisa 21\"','Palheta Silicone Bosch Aerofit 21 polegadas',0.00,45.00,NULL,NULL,NULL,NULL,NULL,NULL),(15,'SKU-PL-002','Palheta Limpador Parabrisa 18\"','Palheta Silicone Bosch Aerofit 18 polegadas',0.00,42.00,NULL,NULL,NULL,NULL,NULL,NULL),(16,'SKU-CR-001','Correia Dentada Gates','Correia Sincronizadora CT488 - Linha Fiat Fire',0.00,75.00,NULL,NULL,NULL,NULL,NULL,NULL),(17,'SKU-TR-001','Terminal de Direção Nakata','Terminal de Direção N-1050 - Lado Direito - Celta/Prisma',0.00,68.00,NULL,NULL,NULL,NULL,NULL,NULL),(18,'SKU-PV-001','Pivô de Suspensão TRW','Pivô da Bandeja - PVI1022 - Ford Fiesta',0.00,85.00,NULL,NULL,NULL,NULL,NULL,NULL),(19,'SKU-AD-001','Aditivo Radiador Paraflu','Aditivo Orgânico Rosa 1L - Concentrado',0.00,25.00,'1763924129094-7fdb9e61.jpg',NULL,NULL,NULL,NULL,NULL),(20,'SKU-LP-001','Lâmpada H4 Super Branca','Par Lâmpada H4 Philips CrystalVision',20.00,90.00,NULL,NULL,NULL,NULL,NULL,NULL),(23,'1231','filtro','filtro para palio',30.00,60.00,'1764270037027-D_NQ_NP_614408-MLB73289130955_122023-O.webp','fiat','motor',4,'palio','2014');
/*!40000 ALTER TABLE `produtos` ENABLE KEYS */;
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
