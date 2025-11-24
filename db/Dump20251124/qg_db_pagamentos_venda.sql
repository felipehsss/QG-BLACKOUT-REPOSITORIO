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
-- Table structure for table `pagamentos_venda`
--

DROP TABLE IF EXISTS `pagamentos_venda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos_venda` (
  `pagamento_id` int(11) NOT NULL AUTO_INCREMENT,
  `venda_id` int(11) NOT NULL,
  `metodo_pagamento` enum('Dinheiro','Cartão de Crédito','Cartão de Débito','PIX') NOT NULL,
  `valor_pago` decimal(10,2) NOT NULL,
  PRIMARY KEY (`pagamento_id`),
  KEY `venda_id` (`venda_id`),
  CONSTRAINT `pagamentos_venda_ibfk_1` FOREIGN KEY (`venda_id`) REFERENCES `vendas` (`venda_id`)
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos_venda`
--

LOCK TABLES `pagamentos_venda` WRITE;
/*!40000 ALTER TABLE `pagamentos_venda` DISABLE KEYS */;
INSERT INTO `pagamentos_venda` VALUES (1,1,'Cartão de Débito',154.00),(2,2,'Cartão de Crédito',751.00),(3,3,'Cartão de Crédito',1170.00),(4,4,'Cartão de Débito',235.00),(5,5,'Cartão de Crédito',330.00),(6,6,'PIX',3255.00),(7,7,'PIX',462.00),(8,8,'PIX',264.00),(9,9,'PIX',135.00),(10,10,'Cartão de Crédito',114.00),(11,11,'Cartão de Crédito',1438.00),(12,12,'Cartão de Débito',1503.00),(13,13,'Cartão de Débito',1590.00),(14,14,'PIX',224.00),(15,15,'Dinheiro',500.00),(16,16,'Cartão de Crédito',148.00),(17,17,'Cartão de Débito',240.00),(18,18,'PIX',45.00),(19,19,'PIX',119.00),(20,20,'Cartão de Débito',611.00),(21,21,'Dinheiro',850.00),(22,22,'Cartão de Crédito',2029.00),(23,23,'Cartão de Débito',645.00),(24,24,'Cartão de Débito',1170.00),(25,25,'Cartão de Débito',655.00),(26,26,'Cartão de Débito',414.00),(27,27,'Cartão de Débito',940.00),(28,28,'Cartão de Débito',460.00),(29,29,'Cartão de Débito',55.00),(30,30,'Dinheiro',824.00),(31,31,'Cartão de Crédito',832.00),(32,32,'Cartão de Crédito',1085.00),(33,33,'PIX',441.00),(34,34,'Cartão de Débito',420.00),(35,35,'Cartão de Crédito',88.00),(36,36,'Dinheiro',176.00),(37,37,'Dinheiro',84.00),(38,38,'Dinheiro',2359.00),(39,39,'Cartão de Crédito',2658.00),(40,40,'Cartão de Crédito',1418.00),(41,41,'Cartão de Crédito',820.00),(42,42,'Cartão de Crédito',1340.00),(43,43,'PIX',3195.00),(44,44,'PIX',272.00),(45,45,'Cartão de Débito',48.00),(46,46,'Cartão de Débito',700.00),(47,47,'PIX',1186.00),(48,48,'Dinheiro',797.00),(49,49,'PIX',1354.00),(50,50,'Dinheiro',1010.00),(51,51,'Cartão de Débito',1580.00),(52,52,'Cartão de Crédito',1140.00),(53,53,'Dinheiro',1275.00),(54,54,'Cartão de Crédito',1440.00),(55,55,'Cartão de Crédito',928.00),(56,56,'Dinheiro',745.00),(57,57,'Cartão de Crédito',780.00),(58,58,'Cartão de Crédito',520.00),(59,59,'Cartão de Crédito',865.00),(60,60,'Cartão de Crédito',895.00),(61,61,'Cartão de Crédito',993.00),(62,62,'Dinheiro',75.00),(63,63,'PIX',2490.00),(64,64,'PIX',1355.00),(65,65,'Dinheiro',1785.00),(66,66,'Cartão de Crédito',900.00),(67,67,'Cartão de Débito',815.00),(68,68,'Dinheiro',134.00),(69,69,'Dinheiro',295.00),(70,70,'Dinheiro',2327.00),(71,71,'Cartão de Crédito',745.00),(72,72,'Dinheiro',1340.00),(73,73,'PIX',191.00),(74,74,'PIX',466.00),(75,75,'PIX',1726.00),(76,76,'PIX',1021.00),(77,77,'PIX',560.00),(78,78,'Dinheiro',544.00),(79,79,'Dinheiro',126.00),(80,80,'Cartão de Débito',1395.00),(81,81,'PIX',173.00),(82,82,'Cartão de Débito',1240.00),(83,83,'Cartão de Crédito',372.00),(84,84,'Dinheiro',2430.00),(85,85,'Cartão de Débito',190.00),(86,86,'Cartão de Crédito',355.00),(87,87,'Cartão de Crédito',976.00),(88,88,'Dinheiro',1495.00),(89,89,'PIX',763.00),(90,90,'PIX',2156.00),(91,91,'Cartão de Crédito',290.00),(92,92,'PIX',1060.00),(93,93,'Cartão de Crédito',1229.00),(94,94,'PIX',90.00),(95,95,'PIX',560.00),(96,96,'PIX',449.00),(97,97,'Cartão de Débito',1050.00),(98,98,'Cartão de Débito',643.00),(99,99,'Dinheiro',38.00),(100,100,'PIX',95.00),(101,101,'Dinheiro',190.00),(102,102,'PIX',1990.00),(103,103,'PIX',258.00),(104,104,'Cartão de Crédito',454.00),(105,105,'Cartão de Débito',602.00),(106,106,'PIX',224.00),(107,107,'Cartão de Crédito',633.00),(108,108,'Cartão de Débito',1362.00),(109,109,'Dinheiro',819.00),(110,110,'Cartão de Débito',1050.00),(111,111,'PIX',2337.00),(112,112,'Cartão de Crédito',95.00),(113,113,'Dinheiro',3090.00),(114,114,'Dinheiro',581.00),(115,115,'Dinheiro',550.00),(116,116,'Cartão de Débito',445.00),(117,117,'Dinheiro',1160.00),(118,118,'Cartão de Débito',780.00),(119,119,'PIX',190.00),(120,120,'Cartão de Crédito',490.00),(121,121,'Cartão de Débito',144.00),(122,122,'Cartão de Débito',216.00),(123,123,'Cartão de Débito',399.00),(124,124,'Cartão de Crédito',456.00),(125,125,'Dinheiro',1052.00),(126,126,'Dinheiro',1140.00),(127,127,'Dinheiro',211.00),(128,128,'Cartão de Crédito',170.00),(129,129,'Cartão de Crédito',330.00),(130,130,'Dinheiro',48.00),(131,131,'Cartão de Crédito',360.00),(132,132,'Dinheiro',780.00),(133,133,'Cartão de Débito',170.00),(134,134,'Cartão de Crédito',220.00),(135,135,'Cartão de Débito',1460.00),(136,136,'Cartão de Crédito',1101.00),(137,137,'Cartão de Débito',900.00),(138,138,'PIX',1245.00),(139,139,'Cartão de Crédito',170.00),(140,140,'PIX',365.00),(141,141,'Cartão de Crédito',2310.00),(142,142,'Cartão de Crédito',345.00),(143,143,'Dinheiro',126.00),(144,144,'Dinheiro',241.00),(145,145,'Dinheiro',280.00),(146,146,'Cartão de Crédito',1195.00),(147,147,'Dinheiro',305.00),(148,148,'Cartão de Crédito',450.00),(149,149,'PIX',696.00),(150,150,'Cartão de Débito',1540.00),(151,151,'PIX',1174.00),(152,152,'Cartão de Débito',1434.00),(153,153,'Cartão de Débito',234.00),(154,154,'Dinheiro',468.00),(155,155,'Cartão de Crédito',2490.00),(156,156,'Cartão de Crédito',915.00),(157,157,'Cartão de Débito',675.00),(158,158,'Cartão de Crédito',2108.00),(159,159,'Cartão de Crédito',1030.00),(160,160,'Cartão de Crédito',420.00),(161,161,'Cartão de Débito',55.00),(162,162,'Dinheiro',418.00),(163,163,'Dinheiro',708.00),(164,164,'Cartão de Crédito',1920.00),(165,165,'Cartão de Crédito',1140.00),(166,166,'Cartão de Débito',45.00),(167,167,'Dinheiro',2642.00),(168,168,'Cartão de Débito',350.00),(169,169,'Dinheiro',975.00),(170,170,'PIX',350.00),(171,171,'Dinheiro',48.00),(172,172,'Dinheiro',435.00),(173,173,'Cartão de Crédito',400.00),(174,174,'Cartão de Crédito',2945.00),(175,175,'PIX',1335.00),(176,176,'Cartão de Débito',2860.00),(177,177,'Cartão de Débito',704.00),(178,178,'PIX',296.00),(179,179,'Cartão de Débito',1625.00),(180,180,'Dinheiro',170.00),(181,181,'Dinheiro',1132.00),(182,182,'Dinheiro',230.00),(183,183,'Dinheiro',1835.00),(184,184,'PIX',345.00),(185,185,'Cartão de Débito',450.00),(186,186,'Dinheiro',2828.00),(187,187,'PIX',805.00),(188,188,'PIX',2186.00),(189,189,'PIX',553.00),(190,190,'Dinheiro',55.00),(191,191,'Cartão de Crédito',328.00),(192,192,'Dinheiro',2806.00),(193,193,'Dinheiro',181.00),(194,194,'PIX',35.00),(195,195,'PIX',805.00),(196,196,'Cartão de Crédito',2091.00),(197,197,'Cartão de Débito',2505.00),(198,198,'Cartão de Débito',585.00),(199,199,'PIX',1190.00),(200,200,'PIX',552.00),(201,201,'Cartão de Débito',815.00),(202,202,'Cartão de Crédito',535.00),(203,203,'PIX',636.00),(204,204,'Cartão de Crédito',200.00),(205,205,'Dinheiro',780.00),(206,206,'Dinheiro',1590.00),(207,207,'Cartão de Crédito',235.00),(208,208,'PIX',1126.00),(209,209,'Cartão de Débito',390.00),(210,210,'Cartão de Crédito',573.00),(211,211,'Dinheiro',450.00),(212,212,'PIX',700.00),(213,213,'PIX',440.00),(214,214,'PIX',847.00),(215,215,'PIX',742.00),(216,216,'Dinheiro',84.00),(217,217,'Dinheiro',266.00),(218,218,'Dinheiro',900.00),(219,219,'Dinheiro',361.00),(220,220,'PIX',190.00),(221,221,'PIX',1920.00),(222,222,'Dinheiro',2020.00),(223,223,'Cartão de Crédito',977.00),(224,224,'Dinheiro',330.00),(225,225,'Dinheiro',1629.00),(226,226,'Cartão de Débito',181.00),(227,227,'Cartão de Crédito',1250.00),(228,228,'Cartão de Débito',520.00),(229,229,'PIX',75.00),(230,230,'Dinheiro',38.00),(231,231,'Cartão de Débito',220.00),(232,232,'PIX',390.00),(233,233,'Dinheiro',635.00),(234,234,'Dinheiro',1354.00),(235,235,'Cartão de Crédito',1175.00),(236,236,'Cartão de Débito',1576.00),(237,237,'Cartão de Crédito',716.00),(238,238,'Dinheiro',1050.00),(239,239,'Dinheiro',399.00),(240,240,'Cartão de Débito',2070.00),(241,241,'Cartão de Débito',1835.00),(242,242,'Dinheiro',240.00),(243,243,'Cartão de Débito',310.00),(244,244,'Cartão de Crédito',900.00),(245,245,'PIX',1864.00),(246,246,'Cartão de Débito',180.00),(247,247,'Dinheiro',1400.00),(248,248,'Cartão de Crédito',38.00),(249,249,'Cartão de Débito',190.00),(250,250,'Dinheiro',338.00);
/*!40000 ALTER TABLE `pagamentos_venda` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24  0:58:16
