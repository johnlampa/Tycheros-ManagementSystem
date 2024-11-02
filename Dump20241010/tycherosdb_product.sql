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
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(45) DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `categoryID` int DEFAULT NULL,
  PRIMARY KEY (`productID`),
  KEY `product_category_ID_idx` (`categoryID`),
  CONSTRAINT `product_category_ID` FOREIGN KEY (`categoryID`) REFERENCES `category` (`categoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'French Fries','/assets/images/MilkTea.jpg',1),(2,'Sweet Potato','/assets/images/MilkTea.jpg',1),(3,'Group Crackers','/assets/images/MilkTea.jpg',1),(4,'Cheese Sticks','/assets/images/MilkTea.jpg',1),(5,'Chicken Nuggets','/assets/images/ChickenNuggets.jpg',1),(9,'Matcha','/assets/images/Matcha.jpg',7),(10,'Taro','/assets/images/Taro.jpg',7),(11,'Tiger','/assets/images/Tiger.jpg',8),(12,'Americano','/assets/images/Americano.jpg',9),(13,'Jack Daniel','/assets/images/JackDaniel.jpg',10),(14,'Soy Pompano','/assets/images/SoyPompano.jpg',2),(15,'Marinated Chicken','/assets/images/MarinatedChicken.jpg',2),(16,'Clubhouse Sandwich','/assets/images/ClubhouseSandwich.jpg',3),(17,'Tyche Burger','/assets/images/TycheBurger.jpg',3),(18,'Fried Milk Fish','/assets/images/FriedMilkFish.jpg',4),(19,'Fried Chicken','/assets/images/FriedChicken.jpg',4),(20,'Tyche Wings','/assets/images/TycheWings.jpg',5),(21,'Bolgogi Spicy Wings','/assets/images/BolgogiSpicyWings.jpg',5),(22,'Vietnamese Spring Rolls','/assets/images/VietnameseSpringRolls.jpg',6),(23,'Green Leafy with Pineapple','/assets/images/GreenLeafywithPineapple.jpg',6),(24,'Smirnoff','/assets/images/Smirnoff.jpg',8),(25,'Hot Coffee','/assets/images/HotCoffee.jpg',9),(26,'Don Papa','/assets/images/DonPapa.jpg',10),(27,'Choco Frappe','/assets/images/ChocoFrappe.jpg',11),(28,'Strawberry Frappe','/assets/images/MilkTea.jpg',11),(29,'Green Tea','/assets/images/GreenTea.jpg',12),(30,'Pepper Mint Tea','/assets/images/PepperMintTea.jpg',12);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-10 13:29:35
