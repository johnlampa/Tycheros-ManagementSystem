// routes/orderingRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "AdDU2202201425196", // Change pw
  database: "tycherosdb"
});

//ORDERING
//PAGE
//ENDPOINTS

// GET MENU DATA ENDPOINT CONFIGURED
router.get('/getCustomerMenu', (req, res) => {
    const query = `
      SELECT 
          p.productID, 
          p.productName, 
          p.imageUrl, 
          c.categoryName AS categoryName, 
          pr.sellingPrice,
          p.status
      FROM 
          product p
      JOIN 
          category c ON p.categoryID = c.categoryID
      JOIN 
          price pr ON p.productID = pr.productID
      WHERE 
          pr.priceDateTime = (
              SELECT MAX(pr2.priceDateTime)
              FROM price pr2
              WHERE pr2.productID = p.productID AND p.status = 1
          )
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching menu data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(result);
    });
  });

// CREATE ORDER ENDPOINT
router.post('/createOrder', (req, res) => {
  const { orderitems, employeeID } = req.body;

  if (!employeeID) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  // First, create the order without status and paymentID, since they may not be required directly in this setup
  const orderQuery = `
    INSERT INTO \`order\` (employeeID)
    VALUES (?)
  `;

  db.query(orderQuery, [employeeID], (err, result) => {
    if (err) {
      console.error("Error creating order:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const orderID = result.insertId;

    // Insert the orderitems if any
    if (orderitems && orderitems.length > 0) {
      const orderItemsQuery = `
        INSERT INTO orderitem (orderID, productID, quantity)
        VALUES ?
      `;

      const orderItemsValues = orderitems.map(item => [orderID, item.productID, item.quantity]);

      db.query(orderItemsQuery, [orderItemsValues], (err) => {
        if (err) {
          console.error("Error creating order items:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Insert initial order status in the `orderstatus` table as 'Unpaid'
        const initialStatusQuery = `
          INSERT INTO orderstatus (orderID, orderStatus, statusDateTime, employeeID)
          VALUES (?, 'Unpaid', NOW(), ?)
        `;

        db.query(initialStatusQuery, [orderID, employeeID], (err) => {
          if (err) {
            console.error("Error setting initial order status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          res.json({ message: "Order and order items created successfully", orderID });
        });
      });
    } else {
      // Insert initial order status if there are no items
      const initialStatusQuery = `
        INSERT INTO orderstatus (orderID, orderStatus, statusDateTime, employeeID)
        VALUES (?, 'Unpaid', NOW(), ?)
      `;

      db.query(initialStatusQuery, [orderID, employeeID], (err) => {
        if (err) {
          console.error("Error setting initial order status:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        res.json({ message: "Order created successfully without order items", orderID });
      });
    }
  });
});
  
module.exports = router;