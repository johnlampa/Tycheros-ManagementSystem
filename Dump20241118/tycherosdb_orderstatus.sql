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
-- Table structure for table `orderstatus`
--

DROP TABLE IF EXISTS `orderstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderstatus` (
  `orderStatusID` int NOT NULL AUTO_INCREMENT,
  `orderID` int NOT NULL,
  `orderStatus` varchar(45) NOT NULL,
  `statusDateTime` datetime NOT NULL,
  `reason` tinyblob,
  `employeeID` int DEFAULT NULL,
  PRIMARY KEY (`orderStatusID`),
  KEY `orderStatus_order_ID_idx` (`orderID`),
  KEY `orderStatus_employee_ID_idx` (`employeeID`),
  CONSTRAINT `orderStatus_employee_ID` FOREIGN KEY (`employeeID`) REFERENCES `employees` (`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderStatus_order_ID` FOREIGN KEY (`orderID`) REFERENCES `order` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderstatus`
--

LOCK TABLES `orderstatus` WRITE;
/*!40000 ALTER TABLE `orderstatus` DISABLE KEYS */;
INSERT INTO `orderstatus` VALUES (1,1,'Unpaid','2024-11-09 14:02:22',NULL,1),(2,2,'Unpaid','2024-11-12 09:26:28',NULL,NULL),(3,3,'Unpaid','2024-11-12 09:33:03',NULL,NULL),(4,4,'Unpaid','2024-11-12 09:35:55',NULL,NULL),(5,5,'Unpaid','2024-11-12 09:37:23',NULL,NULL),(6,6,'Unpaid','2024-11-12 09:42:33',NULL,NULL),(7,7,'Unpaid','2024-11-12 09:46:25',NULL,NULL),(8,8,'Unpaid','2024-11-12 09:48:46',NULL,NULL),(9,9,'Unpaid','2024-11-12 09:52:02',NULL,NULL),(10,10,'Unpaid','2024-11-12 09:52:50',NULL,NULL),(11,11,'Unpaid','2024-11-12 10:02:59',NULL,NULL),(44,1,'Pending','2024-11-16 22:34:09',NULL,2),(66,1,'Completed','2024-11-16 23:33:01',NULL,2),(67,2,'Pending','2024-11-16 23:35:04',NULL,2),(68,2,'Completed','2024-11-16 23:35:18',NULL,2),(69,3,'Pending','2024-11-16 23:36:15',NULL,2),(70,3,'Completed','2024-11-16 23:36:22',NULL,2),(71,4,'Cancelled','2024-11-16 23:38:20',NULL,NULL);
/*!40000 ALTER TABLE `orderstatus` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-18 14:36:49
