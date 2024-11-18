-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: tycherosdb
-- ------------------------------------------------------
-- Server version	8.0.35

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
-- Table structure for table `purchaseorderitem`
--

DROP TABLE IF EXISTS `purchaseorderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseorderitem` (
  `purchaseOrderItemID` int NOT NULL AUTO_INCREMENT,
  `quantityOrdered` int NOT NULL,
  `unitOfMeasurementID` int NOT NULL,
  `pricePerPOUoM` decimal(10,2) NOT NULL,
  `expiryDate` date NOT NULL,
  `purchaseOrderID` int NOT NULL,
  PRIMARY KEY (`purchaseOrderItemID`),
  KEY `POItem_UoM_ID_idx` (`unitOfMeasurementID`),
  KEY `POItem_purchaseOrder_ID_idx` (`purchaseOrderID`),
  CONSTRAINT `POItem_purchaseOrder_ID` FOREIGN KEY (`purchaseOrderID`) REFERENCES `purchaseorder` (`purchaseorderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `POItem_UoM_ID` FOREIGN KEY (`unitOfMeasurementID`) REFERENCES `unitofmeasurement` (`unitOfMeasurementID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseorderitem`
--

LOCK TABLES `purchaseorderitem` WRITE;
/*!40000 ALTER TABLE `purchaseorderitem` DISABLE KEYS */;
INSERT INTO `purchaseorderitem` VALUES (1,1000,2,200.00,'2024-12-02',1),(2,500,2,200.00,'2024-11-09',1),(3,1000,2,30.00,'2024-11-09',1),(4,500,2,20.00,'2024-11-12',1),(5,10,2,5.00,'2024-11-12',3),(6,1,2,15.00,'2024-11-13',4),(7,10,2,40.00,'2024-11-12',4),(8,100,1,1.00,'2024-11-30',5),(9,2,5,60.00,'2024-11-12',6),(10,3,5,50.00,'2024-11-13',7),(11,1,5,60.00,'2024-11-21',7),(12,25,1,34.00,'2024-11-13',8),(13,1,2,60.00,'2024-11-17',9),(14,500,1,30.00,'2024-11-18',9);
/*!40000 ALTER TABLE `purchaseorderitem` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-18 14:36:50
