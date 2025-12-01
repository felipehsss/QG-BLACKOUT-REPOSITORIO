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
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_cliente` enum('PF','PJ') NOT NULL DEFAULT 'PF',
  `cpf` varchar(14) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `razao_social` varchar(100) DEFAULT NULL,
  `nome_fantasia` varchar(100) DEFAULT NULL,
  `inscricao_estadual` varchar(20) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `cnpj` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Ana Beatriz Silva','(11) 91111-1111','ana.silva@email.com','Rua das Flores, 10','2025-11-16 18:18:34','PF','111.111.111-01',NULL,NULL,NULL,NULL,'1763871202823-01- 2023_24 Vasco da Gama \'Camisas Negras\' All Sponsor .png'),(2,'Bruno Costa','(11) 92222-2222','bruno.costa@email.com','Av. Paulista, 1000','2025-11-16 18:18:34','PF','222.222.222-02',NULL,NULL,NULL,NULL,'1763872263080-7d4593a8.jpg'),(3,'Oficina do Zé','(11) 3030-4040','compras@oficinaze.com','Av. Faria Lima, 500','2025-11-16 18:18:34','PJ',NULL,'01.234.567/0001-10','José Auto Peças e Mecânica ME',NULL,NULL,NULL),(4,'Carla Dias','(11) 93333-3333','carla.dias@email.com','Rua Augusta, 200','2025-11-16 18:18:34','PF','333.333.333-03',NULL,NULL,NULL,NULL,NULL),(5,'David Souza','(21) 94444-4444','david.souza@email.com','Rua de Copacabana, 30','2025-11-16 18:18:34','PF','444.444.444-04',NULL,NULL,NULL,NULL,NULL),(6,'Auto Elétrica Impacto','(51) 95555-5555','contato@eletricaimpacto.com','Av. Ipiranga, 800','2025-11-16 18:18:34','PJ',NULL,'02.345.678/0001-20','Impacto Serviços Automotivos Ltda',NULL,NULL,NULL),(7,'Fernanda Moreira','(31) 96666-6666','fernanda.moreira@email.com','Rua da Bahia, 400','2025-11-16 18:18:34','PF','555.555.555-05',NULL,NULL,NULL,NULL,NULL),(8,'Gustavo Lima','(41) 97777-7777','gustavo.lima@email.com','Rua XV de Novembro, 50','2025-11-16 18:18:34','PF','666.666.666-06',NULL,NULL,NULL,NULL,NULL),(9,'Centro Automotivo FastCar','(11) 2020-3030','financeiro@fastcar.com','Rua dos Pinheiros, 600','2025-11-16 18:18:34','PJ',NULL,'03.456.789/0001-30','FastCar Reparos Rápidos ME',NULL,NULL,NULL),(10,'Helena Santos','(11) 98888-8888','helena.santos@email.com','Alameda Santos, 700','2025-11-16 18:18:34','PF','777.777.777-07',NULL,NULL,NULL,NULL,NULL),(11,'empresa fantasma','11992929292','efans@gmail.com','rua bloco b','2025-11-22 20:10:02','PF','56080785564',NULL,NULL,NULL,NULL,NULL),(12,'Jose dos campos','11964673214','jose@gmail.com','rua bloco ca','2025-11-22 20:42:00','PJ',NULL,'33.334.555/2201-04','empresa mecanica ze do campo','meca do ze do campo',NULL,NULL),(14,'carlos','11988877667','carlos@gmail.com','rua paraiso','2025-11-26 18:30:08','PF','56080780987',NULL,NULL,NULL,NULL,NULL),(15,'Carlos Eduardo','11911111883','carloseduardo@outlook.com','Rua Gertulio','2025-11-27 19:29:12','PF','56087858800',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
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
