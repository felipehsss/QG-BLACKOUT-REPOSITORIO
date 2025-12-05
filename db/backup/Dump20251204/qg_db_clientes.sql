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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (16,'Ricardo Oliveira','(11) 99876-5432','ricardo.oli@gmail.com','Rua das Palmeiras, 45, Bairro Jardim - SP','2025-12-02 02:10:20','PF','123.456.789-00',NULL,NULL,NULL,NULL,NULL),(17,'Patrícia Souza','(11) 98765-1234','paty.souza88@hotmail.com','Av. Interlagos, 1200, Apt 34 - SP','2025-12-02 02:10:20','PF','234.567.890-11',NULL,NULL,NULL,NULL,NULL),(18,'Roberto Almeida (Mecânico)','11976543210','beto.mecanica@uol.com.br','Rua da Mooca, 500 - SP','2025-12-02 02:10:20','PJ',NULL,NULL,NULL,NULL,NULL,NULL),(19,'Lucas Pereira','(21) 95555-4444','lucas.pereira@outlook.com','Rua Voluntários da Pátria, 89 - RJ','2025-12-02 02:10:20','PF','456.789.012-33',NULL,NULL,NULL,NULL,NULL),(20,'Mariana Costa','(31) 93333-2222','mari.costa@gmail.com','Av. Afonso Pena, 2000 - MG','2025-12-02 02:10:20','PF','567.890.123-44',NULL,NULL,NULL,NULL,NULL),(21,'Auto Center Rapidez','(11) 3333-4444','compras@rapidezautocenter.com.br','Av. do Estado, 4000 - SP','2025-12-02 02:11:23','PJ',NULL,'12.345.678/0001-90','Rapidez Serviços Automotivos Ltda','Auto Center Rapidez','123.456.789.111',NULL),(22,'Transportadora Ligeiro','(11) 4444-5555','manutencao@ligeiro.com','Rodovia Anhanguera, km 15 - SP','2025-12-02 02:11:23','PJ',NULL,'98.765.432/0001-10','Ligeiro Logística e Transportes SA','Transportadora Ligeiro','987.654.321.222',NULL),(23,'Oficina do Toninho','(11) 5555-6666','toninho.oficina@bol.com.br','Rua Bresser, 80 - SP','2025-12-02 02:11:23','PJ',NULL,'45.678.901/0001-55','Antônio Carlos ME','Oficina do Toninho','ISENTO',NULL),(24,'Frotas e Ciaa','(41) 3030-2020','gestao@frotasecia.com.br','Rua XV de Novembro, 1500 - PR','2025-12-02 02:11:23','PJ',NULL,'33.222.111/0001-00','Gestão de Frotas Corporativas Ltda','Frotas & Cia','111.222.333.444',NULL),(26,'Rogerio Silva','11954756239','rogersilva@gmail.com','Rua lazaré do sul','2025-12-02 02:26:40','PF','56080785523',NULL,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2025-12-04 12:52:07
