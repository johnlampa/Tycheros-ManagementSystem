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
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventoryID` int NOT NULL AUTO_INCREMENT,
  `inventoryName` varchar(45) DEFAULT NULL,
  `inventoryCategory` varchar(45) DEFAULT NULL,
  `reorderPoint` int DEFAULT NULL,
  `unitOfMeasure` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`inventoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,'Potato','Produce',10000,'g'),(2,'Cheese Powder','Dry Goods',500,'g'),(3,'Spaghetti','Dry Goods',100,'kg'),(4,'All-Purpose Cream','Sauces',1000,'oz'),(5,'Ground Pork','Meat and Poultry',10000,'g'),(6,'Bear Brand Powdered Milk','Dry Goods',500,'g'),(7,'BBQ Powder','Dry Goods',500,'g'),(8,'Ground Beef','Meat and Poultry',2500,'g'),(9,'Onion','Produce',1000,'g'),(10,'Cabbage','Produce',1000,'g'),(11,'Salt','Condiments',1000,'g'),(12,'Sugar','Condiments',1000,'g'),(13,'Lettuce','Produce',15,'g'),(14,'Sour Cream Powder','Dry Goods',5000,'g'),(15,'Eggs','Dairy and Eggs',24,'pcs'),(16,'Tiger','Beverages',10,'bottles'),(17,'Jack Daniels','Beverages',12,'bottles'),(18,'Pancit Canton','Dry Goods',10,'packs'),(19,'Cheddar Cheese','Dairy and Eggs',1000,'g');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
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
