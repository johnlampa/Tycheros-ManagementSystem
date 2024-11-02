// routes/orderingRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Fifteen15", // Change pw
  database: "tycherosdb"
});

//ORDERING
//PAGE
//ENDPOINTS

// GET MENU DATA ENDPOINT
router.get('/getCustomerMenu', (req, res) => {
    const query = `
      SELECT p.productID, p.productName, p.imageUrl, c.categoryName as categoryName, pr.sellingPrice
      FROM product p
      JOIN category c ON p.categoryID = c.categoryID
      JOIN price pr ON p.productID = pr.productID
      WHERE pr.priceID = (
          SELECT MAX(pr2.priceID)
          FROM price pr2
          WHERE pr2.productID = p.productID
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
  const { orderitems } = req.body;

  // First, create the order
  const orderQuery = `
    INSERT INTO \`order\` (paymentID, employeeID, date, status)
    VALUES (NULL, 1, CURDATE(), 'Unpaid')
  `;

  db.query(orderQuery, (err, result) => {
    if (err) {
      console.error("Error creating order:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const orderID = result.insertId;

    // Now, insert the orderitems
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

        res.json({ message: "Order and order items created successfully", orderID });
      });
    } else {
      res.json({ message: "Order created successfully without order items", orderID });
    }
  });
});
  
  module.exports = router;