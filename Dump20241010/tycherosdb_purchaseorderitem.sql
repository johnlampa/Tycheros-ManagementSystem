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
  `quantityOrdered` int DEFAULT NULL,
  `actualQuantity` int DEFAULT NULL,
  `pricePerUnit` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `subinventoryID` int DEFAULT NULL,
  `purchaseOrderID` int DEFAULT NULL,
  PRIMARY KEY (`purchaseOrderItemID`),
  UNIQUE KEY `purchaseorderID_UNIQUE` (`purchaseOrderItemID`),
  KEY `purchaseOrderItem_subinventory_ID_idx` (`subinventoryID`),
  KEY `purchaseOrderItem_purchaseOrder_ID_idx` (`purchaseOrderID`),
  CONSTRAINT `purchaseOrderItem_purchaseOrder_ID` FOREIGN KEY (`purchaseOrderID`) REFERENCES `purchaseorder` (`purchaseOrderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchaseOrderItem_subinventory_ID` FOREIGN KEY (`subinventoryID`) REFERENCES `subinventory` (`subinventoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseorderitem`
--

LOCK TABLES `purchaseorderitem` WRITE;
/*!40000 ALTER TABLE `purchaseorderitem` DISABLE KEYS */;
INSERT INTO `purchaseorderitem` VALUES (1,1000,1000,20,'2024-10-10',1,1),(2,200,200,5,'2024-10-10',2,1),(3,300,200,5,'2024-10-10',3,1),(4,100,50,5,'2024-10-09',4,2),(5,20,20,2,'2024-10-09',5,2),(6,10,10,3,'2024-10-11',6,2),(7,200,200,1,'2024-10-11',7,2);
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

-- Dump completed on 2024-10-10 13:29:34
